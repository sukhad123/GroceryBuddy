import { useState,useRef ,useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, X, Mail, Users } from 'lucide-react';
import { Friend, useGrocery } from '@/contexts/GroceryContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FriendsListProps {
  userEmail: {
    userEmail: string;
  };
}

const FriendsList: React.FC<FriendsListProps> = ({ userEmail }) => {

  const { friends, addFriend, removeFriend, loading } = useGrocery();

  const [friends123, setFriends123] = useState<Friend[]>([]);

  const { getAllUsers, user: currentUser } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchBy, setSearchBy] = useState<'username' | 'email'>('username');
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const availableUsers = useRef<{id: string; username: string; email: string; avatarUrl: string}[]>([])
  // Get all available users that are not the current user and not already friends
  useEffect(() => {
    getAvailableUsers();
     
  }, []); // Empty dependency array to run only once
  
  const getAvailableUsers = async () => {
    try {
      const response = await fetch('https://grocery-backend-rose.vercel.app/api/getAllUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminUser: userEmail.userEmail }),
      });
      const data = await response.json();
 
      console.log("API Response:", data);
      
      // Update availableUsers.current with the data from the API
      availableUsers.current = data.data || [];
      console.log("Available users updated:", availableUsers.current);

      // Filter friends to exclude the current user
      const filteredUsers = data.friends.filter(
        (user: { id: string; email: string }) =>
          user.email !== userEmail.userEmail
      );

      setFriends123(filteredUsers);
      setGroupName(data.groupName || '');
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleUpdateGroupName = async () => {
    try {
      const response = await fetch('https://grocery-backend-rose.vercel.app/api/updateGroupName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminUser: userEmail.userEmail,
          groupName: groupName 
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Group name updated!");
      } else {
        toast.error("Failed to update group name");
      }
    } catch (error) {
      console.error('Error updating group name:', error);
      toast.error("Failed to update group name");
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reloading")
    //window.location.reload();

   

    //save the user with this email to the same group
    try{
      const response = await fetch(`https://grocery-backend-rose.vercel.app/api/addUser`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUserEmail: selectedUserId, adminUser:userEmail.userEmail}),
      });
      //update the friends list
      await getAvailableUsers();
     
    }
    catch(err){
      console.log(err);

    }

  
    
   
      
    
      
  
  };

  const handleRemoveFriend = async (id: string) => {
    await removeFriend(id);
  };

  /*if (loading && friends.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Friends</h3>
        <div className="glass p-6 rounded-xl flex justify-center">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }*/

  //const availableUsers =  getAvailableUsers();
 

  return (
    <div className="mb-6">
      {/* Group Name Section */}
      <div className="glass p-4 rounded-xl mb-4">
        <div className="flex items-center gap-3 p-4 bg-secondary/50 dark:bg-secondary/20 rounded-lg border border-border">
          <div className="p-2 bg-primary/10 rounded-full">
            <Users size={24} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Group Name: <span className="text-primary">{groupName}</span>
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Friends ({friends123.length})</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center text-sm text-primary hover:underline"
          >
            <UserPlus size={16} className="mr-1" />
            Add Friend
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass p-4 rounded-xl mb-4"
            onSubmit={handleAddFriend}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add Friend</h4>
                <button
  type="button"
  onClick={() => setIsAdding(false)}
  className="p-1 rounded-full hover:bg-red-600 text-white hover:text-white transition-colors bg-gray-800"
>
  <X size={16} />
</button>

              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex items-center">
                  <Users size={16} className="mr-2" />
                  Select User to Add as Friend
                </label>
                
                {availableUsers.current.length > 0 ? (
                  <>
                  <Select 
                    value={selectedUserId} 
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.current.map(user => (
                        <SelectItem key={user.email} value={user.email}>
                          <div className="flex items-center gap-2">
                          
                           
                            {user.email && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({user.email})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                    
                  </Select>
                  <div>
</div>
                  </>
                  
                ) : (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    No available users to add as friends
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={submitting || availableUsers.current.length === 0}
                className="w-full"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <UserPlus size={16} className="mr-2" />
                )}
                Add Friend
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      
      {friends123.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3"
        >
          <User size={40} className="text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium">No friends yet</h3>
          <p className="text-muted-foreground">
            Add friends to share your grocery lists
          </p>
        </motion.div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {friends123.map(friend => (
              <motion.li
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass flex items-center justify-between p-3 rounded-xl group"
              >
                <div className="flex items-center gap-3">
                  
                  <span className="font-medium">{friend.email}</span>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-600 transition-opacity"
                >
                  <X size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
