import React, { useEffect, useState } from 'react'
import { 
  Container, 
  VStack, 
  Text, 
  Center, 
  SimpleGrid, 
  useToast, 
  Spinner, 
  Flex,
  Button,
  HStack,
  Box,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useProductStore } from '../store/product'
import ProductCard from '../components/ProductCard'
import DeleteConfirmation from '../components/DeleteConfirmation'
import { SearchIcon } from '@chakra-ui/icons'

const HomePage = () => {
  const { fetchProducts, products, deleteProduct, pagination } = useProductStore();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // For delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productNameToDelete, setProductNameToDelete] = useState('');

  // Set up debounce for search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
    React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts(currentPage, 6, debouncedSearchQuery);
      setLoading(false);
    };
    
    loadProducts();
  }, [fetchProducts, currentPage, debouncedSearchQuery]);

  // Filter products locally based on search query
  React.useEffect(() => {
    if (debouncedSearchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowercaseQuery = debouncedSearchQuery.toLowerCase();
      
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) || 
        product.price.toString().includes(lowercaseQuery)
      );
      
      setFilteredProducts(filtered);
    }
  }, [products, debouncedSearchQuery]);

  // Edit handler to navigate to edit page
  const navigate = useNavigate();
  
  const handleEdit = (product) => {
    navigate(`/edit/${product._id}`);
  };

  // Handler to open delete confirmation dialog
  const openDeleteDialog = (id) => {
    const productToRemove = products.find(p => p._id === id);
    if (productToRemove) {
      setProductToDelete(id);
      setProductNameToDelete(productToRemove.name);
      setIsDeleteDialogOpen(true);
    }
  };

  // Handle actual product deletion
  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const result = await deleteProduct(productToDelete);
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        status: result.success ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      setProductNameToDelete('');
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Container maxW='container.xl' py={12}>
      <VStack spacing={8}>
        <Text
          fontSize={30}
          fontWeight={"bold"}
          bgGradient={"linear(to-r,cyan.400,blue.500)"}
          bgClip={"text"}
          textAlign={"center"}
        >
          Current Products
        </Text>
        
        {/* Search input */}
        <Box w="full" maxW="md">
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <SearchIcon color='gray.500' />
            </InputLeftElement>
            <Input 
              placeholder='Search products by name or price...' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="full"
            />
          </InputGroup>
          {searchQuery && (
            <HStack justifyContent="flex-end" mt={2}>
              <Button 
                size="sm"
                colorScheme="blue" 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </HStack>
          )}
        </Box>
        
        {/* Delete confirmation dialog */}
        <DeleteConfirmation 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleConfirmDelete}
          productName={productNameToDelete}
        />
        
        {loading ? (
          <Flex justifyContent="center" alignItems="center" height="300px">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          </Flex>
        ) : (
          <VStack spacing={8} w="full">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} w="full">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={openDeleteDialog}
                  />
                ))
              ) : (
                <Text fontSize="xl" textAlign={"center"} fontWeight={'bold'} color={"gray"}>
                  {searchQuery ? "No products match your search" : "NO PRODUCTS Found"} {" "}
                  <Link to={"/create"}>
                    <Text as="span" color="blue.500" _hover={{ textDecoration: "underline" }}>
                      Create a product
                    </Text>
                  </Link>
                </Text>
              )}
            </SimpleGrid>
            
            {pagination && pagination.totalPages > 1 && !searchQuery && (
              <Box mt={8} w="full">
                <HStack spacing={2} justifyContent="center">
                  <Button 
                    colorScheme="blue" 
                    variant="outline"
                    isDisabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(pagination.totalPages)].map((_, idx) => (
                    <Button 
                      key={idx} 
                      colorScheme="blue"
                      variant={pagination.currentPage === idx + 1 ? "solid" : "outline"}
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                  
                  <Button 
                    colorScheme="blue" 
                    variant="outline"
                    isDisabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default HomePage;
