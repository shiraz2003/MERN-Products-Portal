import React, { useState, useEffect, useRef } from 'react';
import { 
  useColorMode, VStack, Container, Box, Heading, Button, 
  Text, Image, Input, FormControl, FormLabel, FormErrorMessage, useToast
} from '@chakra-ui/react';
import { useProductStore } from '../store/product';
import { useNavigate, useParams } from 'react-router-dom';
import { getCompleteImageUrl } from '../utils/imageUtils';

const EditProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    image: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    price: false,
    image: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: "", isError: false });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const { products, updateProduct, uploadImage } = useProductStore();

  // Find the product with matching ID
  useEffect(() => {
    if (products.length > 0) {
      const existingProduct = products.find(p => p._id === id);
      if (existingProduct) {
        setProduct(existingProduct);
        setPreviewImage(existingProduct.image);
      } else {
        // Product not found - redirect back to home
        toast({
          title: "Product not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      }
    }
  }, [id, products, navigate, toast]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      setStatus({ message: "Please select an image", isError: true });
      return false;
    }
    
    setIsLoading(true);
    const response = await uploadImage(fileInputRef.current.files[0]);
    setIsLoading(false);
    
    if (response.success) {
      setProduct({ ...product, image: response.image });
      setStatus({ message: "Image uploaded successfully", isError: false });
      return true;
    } else {
      setStatus({ message: response.message || "Failed to upload image", isError: true });
      return false;
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      name: !product.name.trim(),
      price: product.price <= 0,
      image: !product.image
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleUpdateProduct = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields correctly",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // If there's a file selected but image path isn't set, upload first
    if (fileInputRef.current?.files?.length && fileInputRef.current.files[0].name) {
      const uploadSuccess = await handleImageUpload();
      if (!uploadSuccess) {
        setIsLoading(false);
        return;
      }
    }
    
    const {success, message} = await updateProduct(id, product);
    setIsLoading(false);
    
    if (success) {
      toast({
        title: "Success",
        description: message || "Product updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
    } else {
      toast({
        title: "Error",
        description: message || "Failed to update product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={8}>
        <Heading as="h1" size="xl" textAlign="center" mb={4}>
          Edit Product
        </Heading>
        <Box w="full" bg={useColorMode().colorMode === "light" ? "white" : "gray.700"} p={6} rounded={"lg"} shadow="md">
          <VStack spacing={4} align="stretch">
            {status.message && (
              <Text 
                color={status.isError ? "red.500" : "green.500"} 
                fontWeight="medium"
                textAlign="center"
              >
                {status.message}
              </Text>
            )}
            
            <FormControl isInvalid={errors.name}>
              <FormLabel>Product Name</FormLabel>
              <Input 
                placeholder='Product name'
                name='name'
                value={product.name}
                onChange={(e) => {
                  setProduct({ ...product, name: e.target.value });
                  if (e.target.value.trim()) setErrors({...errors, name: false});
                }}
              />
              <FormErrorMessage>Product name is required</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.price}>
              <FormLabel>Price</FormLabel>
              <Input
                placeholder='Price'
                name='price'
                type='number'
                value={product.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setProduct({ ...product, price: value });
                  if (value > 0) setErrors({...errors, price: false});
                }}
              />
              <FormErrorMessage>Price must be greater than 0</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.image}>
              <FormLabel>Product Image</FormLabel>              {previewImage && (
                <Box my={4}>
                  <Image 
                    src={getCompleteImageUrl(previewImage)}
                    alt="Preview" 
                    boxSize="200px" 
                    objectFit="cover" 
                    borderRadius="md"
                  />
                </Box>
              )}
              
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  handleImageChange(e);
                  if (e.target.files.length > 0) setErrors({...errors, image: false});
                }}
                p={1}
              />
                <Button 
                mt={2} 
                colorScheme='teal' 
                onClick={handleImageUpload}
                isLoading={isLoading}
                loadingText="Uploading..."
                size="sm"
                disabled={!fileInputRef.current?.files?.length}
              >
                Upload New Image
              </Button>
              <FormErrorMessage>Product image is required</FormErrorMessage>
            </FormControl>
            
            {product.image && (
              <Text fontSize="sm" color="green.500">
                Image path: {product.image}
              </Text>
            )}
              <Button 
              colorScheme='blue' 
              onClick={handleUpdateProduct}
              isLoading={isLoading}
              loadingText="Updating..."
              mt={4}
              isDisabled={!product.name || !product.price}
            >
              Update Product
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              mt={2}
            >
              Cancel
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditProductPage;
