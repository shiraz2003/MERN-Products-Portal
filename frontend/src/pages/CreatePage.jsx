import { 
  useColorMode, 
  VStack, 
  Container, 
  Box, 
  Heading, 
  Button, 
  Text, 
  Image, 
  Input, 
  FormControl, 
  FormLabel,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react';
import { getCompleteImageUrl } from '../utils/imageUtils';
import React, { useState, useRef } from 'react';
import { useProductStore } from '../store/product';
import { useNavigate } from 'react-router-dom';

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
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

  const {createProduct, uploadImage} = useProductStore();
  
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
      setNewProduct({ ...newProduct, image: response.image });
      setStatus({ message: "Image uploaded successfully", isError: false });
      return true;
    } else {
      setStatus({ message: response.message || "Failed to upload image", isError: true });
      return false;
    }
  };    const validateForm = () => {
      const newErrors = {
        name: !newProduct.name.trim(),
        price: newProduct.price <= 0,
        image: !newProduct.image && !fileInputRef.current?.files?.length
      };
      
      setErrors(newErrors);
      return !Object.values(newErrors).some(error => error);
    };
    
    const handleAddProduct = async() => {
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
      if (fileInputRef.current?.files?.length && !newProduct.image) {
        const uploadSuccess = await handleImageUpload();
        if (!uploadSuccess) {
          setIsLoading(false);
          return;
        }
      }
      
      console.log("Submitting product:", newProduct);
      
      const {success, message} = await createProduct(newProduct);
      setIsLoading(false);
      
      if (success) {
        toast({
          title: "Success",
          description: message || "Product created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setNewProduct({name:"", price: 0, image:""});
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
      } else {
        toast({
          title: "Error",
          description: message || "Failed to create product",
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
          Create New Product
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
                value={newProduct.name}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, name: e.target.value });
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
                value={newProduct.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewProduct({ ...newProduct, price: value });
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
                Upload Image
              </Button>
              <FormErrorMessage>Product image is required</FormErrorMessage>
            </FormControl>
            
            {newProduct.image && (
              <Text fontSize="sm" color="green.500">
                Image path: {newProduct.image}
              </Text>
            )}
              <Button 
              colorScheme='blue' 
              onClick={handleAddProduct}
              isLoading={isLoading}
              loadingText="Creating..."
              mt={4}
              isDisabled={!newProduct.name || !newProduct.price}
            >
              Create Product
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreatePage;
