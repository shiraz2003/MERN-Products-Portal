import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import EditProductPage from './pages/EditProductPage';
import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    
      <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.800")}>

        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/edit/:id" element={<EditProductPage />} />
        </Routes>
      </Box>

  );
}

export default App;
