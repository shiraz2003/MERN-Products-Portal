import { create } from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),    createProduct: async (newProduct) => {
        if (!newProduct.name || !newProduct.image || !newProduct.price) {
            return { success: false, message: "please fill all fields" }
        }
        
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(newProduct)
            })
            
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


}));