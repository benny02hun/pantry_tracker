'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem } from '@mui/material';
import { firestore } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#f0f4f8', // Lighter background color for modal
  borderRadius: '12px', // Softer corners
  boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)', // Softer shadow
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [type, setType] = useState('food');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');

  const updatePantry = async (filterType = null) => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      const data = { name: doc.id, ...doc.data() };
      if (!filterType || data.type === filterType) {
        pantryList.push(data);
      }
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item, type) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, type: type });
    } else {
      await setDoc(docRef, { quantity: 1, type: type });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap={4}
      sx={{ background: 'linear-gradient(135deg, #f3e5f5, #b39ddb)' }} // Gradient background
    >
      {/* Title */}
      <Box 
        width={'800px'} 
        height={'100px'} 
        bgcolor={'#673ab7'} 
        display={'flex'} 
        justifyContent={"center"} 
        alignItems={'center'}
        borderRadius="12px"
      >
        <Typography
          variant="h3"
          color={'#fff'}
          textAlign={'center'}
          textTransform={'capitalize'}
        >
          Pantry Tracker
        </Typography>
      </Box>

      {/* Button Group */}
      <Stack spacing={2} direction="column">
        <Button variant="contained" color="secondary" onClick={() => updatePantry('food')}>
          Show Food
        </Button>
        <Button variant="contained" color="secondary" onClick={() => updatePantry('drink')}>
          Show Drinks
        </Button>
        <Button variant="contained" color="secondary" onClick={() => updatePantry()}>
          Show All
        </Button>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add New Item
        </Button>
      </Stack>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack direction="column" spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
            >
              <MenuItem value="food">Food</MenuItem>
              <MenuItem value="drink">Drink</MenuItem>
            </TextField>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName, type);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Item List */}
      <Box border={'1px solid #673ab7'} borderRadius="12px" overflow="hidden" padding={2} width="800px">
        <Stack spacing={2} maxHeight="300px" overflow="auto">
          {pantry.map((item, index) => (
            <Box
              key={`${item.name}-${index}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor={'#e8eaf6'}
              borderRadius="8px"
              paddingX={3}
              paddingY={2}
            >
              <Typography variant="h6" color={'#3f51b5'} flexGrow={1}>
                {item.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" color={'#3f51b5'}>
                  Quantity: {item.quantity}
                </Typography>
                <Button variant="outlined" color="secondary" onClick={() => removeItem(item.name)}>
                  -
                </Button>
                <Button variant="contained" color="secondary" onClick={() => addItem(item.name, item.type)}>
                  +
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
