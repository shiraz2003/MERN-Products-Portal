import React from 'react'
import { Box, Image, Heading, Text, HStack, IconButton, Badge, Flex } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { getCompleteImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product, onEdit, onDelete }) => { 
    // Format price to 2 decimal places
    const formattedPrice = parseFloat(product.price).toFixed(2);
    
    // Calculate time since product was created
    const getTimeSince = (dateString) => {
        const created = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month(s) ago`;
        return `${Math.floor(diffDays / 365)} year(s) ago`;
    };
    
    return (
        <Box 
            shadow="lg" 
            rounded="lg" 
            overflow="hidden" 
            transition="all 0.3s" 
            _hover={{ 
                transform: "translateY(-5px)", 
                shadow: "xl",
                '& .product-actions': {
                    opacity: 1,
                    transform: 'translateY(0)'
                }
            }}
            position="relative"
        >
            <Box position="relative">
                <Image 
                    src={getCompleteImageUrl(product.image)} 
                    alt={product.name} 
                    h={48} 
                    w="full" 
                    objectFit='cover'
                />
                
                {/* Action buttons with hover effect */}
                <Flex 
                    className="product-actions"
                    position="absolute" 
                    bottom={0} 
                    left={0}
                    right={0}
                    p={2}
                    bg="blackAlpha.600"
                    opacity={0}
                    transform="translateY(10px)"
                    transition="all 0.3s"
                    justifyContent="flex-end"
                >
                    <HStack spacing={2}>
                        <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit product"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => onEdit && onEdit(product)}
                        />
                        <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete product"
                            size="sm"
                            colorScheme="red"
                            onClick={() => onDelete && onDelete(product._id)}
                        />
                    </HStack>
                </Flex>
                
                {/* New badge */}
                {product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <Badge 
                        position="absolute" 
                        top={2} 
                        right={2}
                        colorScheme="green" 
                        variant="solid"
                        borderRadius="full"
                        px={2}
                    >
                        New
                    </Badge>
                )}
            </Box>
            
            <Box p={4}>
                <Heading as="h3" size="md" mb={2} noOfLines={1}>
                    {product.name}
                </Heading>

                <Text fontWeight="bold" fontSize="xl" color="blue.500" mb={2}>
                    ${formattedPrice}
                </Text>
                
                {product.createdAt && (
                    <Text fontSize="sm" color="gray.500">
                        Added: {getTimeSince(product.createdAt)}
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default ProductCard;
