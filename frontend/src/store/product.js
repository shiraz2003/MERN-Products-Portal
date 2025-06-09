import { create } from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasMore: false
    },
    
    setProducts: (products) => set({ products }),
    
    // Get a single product by ID
    getProduct: (id) => {
        const { products } = useProductStore.getState();
        return products.find(product => product._id === id);
    },
    
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const res = await fetch('/api/products/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!res.ok) {
                return { success: false, message: `Server error: ${res.status}` };
            }
            
            const data = await res.json();
            if (data && data.image) {
                return { success: true, image: data.image };
            } else {
                return { success: false, message: "Invalid server response" };
            }
        } catch (error) {
            console.error("Image upload error:", error);
            return { success: false, message: "Failed to upload image" };
        }
    },
    
    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.image || !newProduct.price) {
            return { success: false, message: "please fill all fields" }
        }
        
        // Make sure price is a number
        const productToSend = {
            ...newProduct,
            price: Number(newProduct.price)
        };
        
        console.log("Sending to backend:", productToSend);
        
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(productToSend)
            });
            
            if (!res.ok) {
                return { success: false, message: `Server error: ${res.status}` };
            }
            
            const data = await res.json();
            if (data && data.data) {
                set((state) => ({ products: [...state.products, data.data] }))
                return { success: true, message: "product created successfully" };
            } else {
                return { success: false, message: "Invalid server response" };
            }
        } catch (error) {
            console.error("Product creation error:", error);
            return { success: false, message: "Failed to create product" };
        }
    },
      fetchProducts: async (page = 1, limit = 6, search = '') => {
        try {
            const searchParams = new URLSearchParams({
                page,
                limit,
                ...(search && { search })
            });
            
            const res = await fetch(`/api/products?${searchParams.toString()}`);
            if (!res.ok) {
                return { success: false, message: `Server error: ${res.status}` };
            }
            
            const data = await res.json();
            
            set({ 
                products: data.data,
                pagination: data.pagination || {
                    currentPage: page,
                    totalPages: 1,
                    totalProducts: data.data.length,
                    hasMore: false
                }
            });
            
            return { 
                success: true, 
                pagination: data.pagination 
            };
        } catch (error) {
            console.error("Error fetching products:", error);
            return { success: false, message: "Failed to fetch products" };
        }
    },
    
    deleteProduct: async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                return { success: false, message: `Server error: ${res.status}` };
            }
            set((state) => ({
                products: state.products.filter((product) => product._id !== id)
            }));
            return { success: true, message: "Product deleted successfully" };
        } catch (error) {
            console.error("Product deletion error:", error);
            return { success: false, message: "Failed to delete product" };
        }
    },
    
    updateProduct: async (id, updatedProduct) => {
        try {
            // Make sure price is a number
            const productToSend = {
                ...updatedProduct,
                price: Number(updatedProduct.price)
            };
            
            const res = await fetch(`/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(productToSend)
            });
            
            if (!res.ok) {
                return { success: false, message: `Server error: ${res.status}` };
            }
            
            const data = await res.json();
            if (data && data.data) {
                set((state) => ({
                    products: state.products.map(product => 
                        product._id === id ? data.data : product
                    )
                }));
                return { success: true, message: "Product updated successfully" };
            } else {
                return { success: false, message: "Invalid server response" };
            }
        } catch (error) {
            console.error("Product update error:", error);
            return { success: false, message: "Failed to update product" };
        }
    },
}));