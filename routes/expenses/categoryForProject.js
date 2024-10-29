const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { verifyToken } = require('../../utils');

// Middleware to parse URL-encoded bodies
router.use(express.urlencoded({ extended: true }));

// POST request to create a new category
router.post('/', verifyToken, async (req, res) => {
    const { categoryTitle, description } = req.body;

    try {                                            
        await admin.firestore().collection('categories').add({
            categoryTitle: categoryTitle,    
            description: description,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'Added a new category successfully', data: { categoryTitle: categoryTitle, description: description,} });
    } catch (error) {
        res.status(500).json({ success: false, error: `Server error ${error}` });
    }
});

// GET request to retrieve all categories
router.get('/', verifyToken, async (req, res) => {
    try {
        const categoriesSnapshot = await admin.firestore().collection('categories').get();
        const categories = categoriesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                categoryTitle: data.categoryTitle,
                description: data.description,
                created_at: data.created_at ? new Intl.DateTimeFormat('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: 'numeric', minute: 'numeric', second: 'numeric', 
                    hour12: true, timeZone: 'UTC'
                }).format(data.created_at.toDate()) : null,
                updated_at:data.updated_at ? new Intl.DateTimeFormat('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: 'numeric', minute: 'numeric', second: 'numeric', 
                    hour12: true, timeZone: 'UTC'
                }).format(data.updated_at.toDate()) : null
            };
        });

        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: `Server error ${error}` });
    }
});


// PUT request to update a category by ID
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { categoryTitle, description } = req.body;

    try {
        await admin.firestore().collection('categories').doc(id).update({
            categoryTitle: categoryTitle,
            description: description,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(204).json({ success: true, message: `Category with ID ${id} updated successfully`, data: { categoryTitle: categoryTitle, description: description,} });
    } catch (error) {
        res.status(500).json({ success: false, error: `Server error ${error}` });
    }
});

// DELETE request to delete a category by ID
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        await admin.firestore().collection('categories').doc(id).delete();
        res.status(200).json({ success: true, message: `Category with ID ${id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, error:  error });
    }
});

module.exports = router;
