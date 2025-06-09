import react, {useState, useEffect, useContext, createContext} from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) =>{

    const [user, setUser] = useState(() =>{
        try{
            const storedUser = localStorage.getItem('ecomUser')
            return storedUser? JSON.parse(storedUser): null
        } catch(error){
            console.error("Failed to parse user from local storage:", error);
        return null;
        }
    })

    useEffect(() =>{
        try{
            if(user){

                localStorage.setItem('ecomUser', JSON.stringify(user))
            }
            else{
                localStorage.removeItem('ecomUser')
            }
        }catch(error){
            console.error("Failed to save/remove user to local storage:", error)
        }
    }
        ,[user])

    const login = (username, password) =>{
    // In a real app: Send username/password to backend, get token/user data back
    // For simulation: Simple check for "user" and "password"
    if (username === 'user' && password === 'password') {
      const dummyUser = { id: '1', username: 'user', email: 'user@example.com' };
      setUser(dummyUser);
      return true; // Login successful
    }
    return false; // Login failed
  };

  const logout = () =>{
    setUser(null)
  }

  const authContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout
  }
  return (
    <AuthContext.Provider value={authContextValue}>
    {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () =>{
    return useContext(AuthContext)
}