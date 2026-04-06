import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // cartItems acts as exactly our Draft Sessions
    const [cartItems, setCartItems] = useState([]);

    // Load drafts from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart_drafts');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Basic validation
                const validItems = parsed.filter(item => item.product && item.id);
                setCartItems(validItems);
            } catch (e) {
                console.error("Failed to parse cart drafts", e);
                localStorage.removeItem('cart_drafts');
            }
        }
    }, []);

    // Save drafts to localStorage on change (strip out raw Files because they break JSON)
    useEffect(() => {
        const draftsToSave = cartItems.map(draft => {
            const { customImages, ...safeDraft } = draft; // Remove File objects for safety
            return safeDraft;
        });
        localStorage.setItem('cart_drafts', JSON.stringify(draftsToSave));
    }, [cartItems]);

    // Save or update a draft checkout session
    const saveDraft = (draftData) => {
        setCartItems(prev => {
            const existingIdx = prev.findIndex(item => item.id === draftData.id);
            if (existingIdx > -1) {
                const newDrafts = [...prev];
                newDrafts[existingIdx] = draftData;
                return newDrafts;
            } else {
                return [...prev, draftData];
            }
        });
    };

    // Remove a draft checkout session
    const removeDraft = (draftId) => {
        setCartItems(prev => prev.filter(item => item.id !== draftId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Unchanged for compatibility
    const cartTotal = cartItems.reduce((acc, draft) => {
        const sizeObj = draft.product.sizes?.find(s => s.label === draft.selectedSize);
        const price = (sizeObj && sizeObj.price > 0) ? sizeObj.price : draft.product.price;
        return acc + (price * draft.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, saveDraft, removeDraft, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
