import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useGrocery, Category } from '@/contexts/GroceryContext';

const AddItemForm: React.FC = () => {
  const category= useRef<String>('');

  const { addItem, getAvailableItems } = useGrocery();
  const [itemName, setItemName] = useState('');

  const [price, setPrice] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  


  const handleSubmit = async (e: React.FormEvent)  => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert('Item name cannot be empty!');
      return;
    }
  
    
    //use deepseek to validate the item and assign a

    //verify the item and then add it to the database
 
    //let's validate the item
    //intialize with empty
   category.current ='';
     try {
      // Make the API call to validate the item
      const response = await fetch(
        `https://kgsearch.googleapis.com/v1/entities:search?query=${itemName}&key=AIzaSyDfIPFlmFisBeMx_T0LBeP6Jfc6TG_8fYI&types=Food`
      );
      const data = await response.json();

      // Validate the data using the function
      const validItem = data.itemListElement.some((item: any) => {
        const description = item.result?.description?.toLowerCase() || '';
        const terms = ['fruit', 'vegetable', 'food', 'meat', 'dairy', 'pantry', 'other'];

        // Check if any term is found in the description
        const matchedTerm = terms.find((term) => description.includes(term));

        if (matchedTerm) {
          category.current = item.result.description; // Set category if a match is found
        }
      });

      // Check if category has been updated and proceed to add the item
      if (category.current) {
        await addItem(itemName, category.current); // Add item if valid
      } else {
        alert('Please add a valid item');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('An error occurred while fetching data');
    }    
       

 
    
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="mb-6">
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass glass-hover shadow-sm"
        >
          <Plus size={18} className="text-primary" />
          <span className="font-medium">Add Item</span>
        </motion.button>
      )}

      {isExpanded && (
        <motion.form
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="glass p-4 rounded-xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium mb-1">
                Item Name
              </label>
              <input
                id="itemName"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Add a new item..."
                className="w-full p-3 rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              
              <div>
              
                
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={18} />
                Add Item
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="py-2 px-4 rounded-lg border hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      )}
    </div>
  );
};

export default AddItemForm;
