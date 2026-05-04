import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    
    useEffect(() => {
        const storedWishlist = localStorage.getItem('craftelle_wishlist');
        if (storedWishlist) {
            try {
                setWishlistItems(JSON.parse(storedWishlist));
            } catch (e) {
                console.error("Could not parse wishlist from local storage", e);
            }
        }
    }, []);

    
    useEffect(() => {
        localStorage.setItem('craftelle_wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        if (!user) {
            showNotification("Please login to add items to your wishlist.", "warning");
            navigate('/login');
            return false;
        }

        const exists = wishlistItems.find(item => item._id === product._id);
        if (exists) return false;

        setWishlistItems((prev) => [...prev, product]);
        return true;
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => prev.filter(item => item._id !== productId));
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            clearWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
