import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});


const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const InstagramAuth: React.FC = () => {
  const navigate = useNavigate();
  const userEmail = useRef<string>("");
  const { user, loading, signUp, signIn, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const errRef = useRef<string>("");
  const [newPage, setNewPage] = useState(false);
  const [groupEmail, setGroupEmail] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");

  const handleClick = () => {
    // Basic redirect
    //navigate('/main');
    }

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
 
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
     
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (isLogin) {
      try {
        const response = await fetch('https://grocery-backend-rose.vercel.app/api/userLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: values.email, password: values.password }),
          credentials: 'include',
        });
        const data = await response.json();
        if (data.error) {
          errRef.current = data.error;
      
        } else {
          errRef.current = "";
          localStorage.setItem('userEmail',values.email);
          navigate('/main');
        }
      } catch (err) {
        console.log("err");
      }
    } else {
      try {
        const response = await fetch('https://grocery-backend-rose.vercel.app/api/createUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: values.email, password: values.password }),
          credentials: 'include',
        });
        const data = await response.json();
        if (data.error) {
          errRef.current = data.error;
          return
      
        } else {
          errRef.current = "";
        }
      } catch (err) {
        console.log("err");
        return
      }
      userEmail.current = values.email;
      //set the user email in local storage
      localStorage.setItem('userEmail',values.email);
      setNewPage(true);
      // Handle signup logic...
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
   if(isLogin){
    console.log("Login data")
   }
   else{
    console.log("Signup")
   }
    await signUp(values.username, values.email, values.password);
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
  };

  const handleCreateGroup = async () => {
    console.log("Creating group:", groupName);
    try {
      const response = await fetch('http://localhost:3000/api/createGroup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName: groupName, user:userEmail}),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.error) {
        errRef.current = data.error;
        return
    
      } else {
        errRef.current = "";
      }
    } catch (err) {
      console.log("err");
      return
    }
    navigate('/main');
    //send the data to update the user in that group
    // Call your API to create a group here
  };

  const handleJoinGroup = async () => {
    console.log("Joining group with email:", groupEmail);
    // Call your API to join a group here
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass p-4 rounded-xl mb-6 flex justify-center"
      >
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>
    );
  }

  if (user?.isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 glass rounded-xl mb-6"
      >
        <div className="flex items-center gap-3">
          <img 
            src={user.avatarUrl} 
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </motion.div>
    );
  }

  return (
    <>
      {!newPage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl mb-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <User size={24} />
              <h3 className="font-semibold text-xl">
                {isLogin ? "Login to Your Account" : "Create an Account"}
              </h3>
            </div>

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input className="pl-10" placeholder="your.email@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input className="pl-10" type="password" placeholder="••••••" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>Login</>
                  )}
                </Button>
              </form>
            </Form>
          
          
          <div className="text-center">
            <button
              type="button"
              onClick={switchForm}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
          
          <p className="text-xs text-center" style={{ color: 'red' }}>
            {errRef.current}
          </p>
        </div>
      </motion.div>

      )}
      
      {newPage && (
       <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-white shadow-lg p-6 rounded-2xl w-full max-w-md mx-auto"
     >
       <h3 className="font-semibold text-2xl text-center mb-4">Create or Join a Group</h3>
       <div className="space-y-6">
         {/* Create Group Section */}
         <div className="p-4 bg-gray-100 rounded-xl">
           <h4 className="font-medium text-lg mb-2">Create a New Group</h4>
           <Input 
             placeholder="Group Name" 
             value={groupName} 
             onChange={(e) => setGroupName(e.target.value)} 
             className="mb-3"
           />
           <Button onClick={handleCreateGroup} className="w-full py-2 text-lg">
             Create Group
           </Button>
         </div>
         
         {/* Join Group Section */}
         <div className="p-4 bg-gray-100 rounded-xl">
           <h4 className="font-medium text-lg mb-2">Join an Existing Group<br></br>Let your friends know about you and ask them to add in that group</h4>
          

         </div>
       </div>
     </motion.div>
      )}
    </>
  );
};

export default InstagramAuth;
