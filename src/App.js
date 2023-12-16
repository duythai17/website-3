import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css'; // Import the app.css file

const socket = io('http://localhost:3001');

function App() {
    const [weight, setWeight] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/getWeightFromUpdateTest');
                setWeight(response.data.weight);
            } catch (error) {
                console.error(error);
            }
        };

        const updateInterval = setInterval(fetchData, 1000);

        const handleUpdateWeight = (data) => {
            console.log('Received updated weight:', data.weight);
            setWeight(data.weight);
        };

        socket.on('updateWeight', handleUpdateWeight);

        return () => {
            clearInterval(updateInterval);
            socket.off('updateWeight', handleUpdateWeight);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="container">
            <h1>Weight from MongoDB Atlas</h1>
            {weight !== null ? (
                <p>Weight: {weight}</p>
            ) : (
                <p className="loading">Loading...</p>
            )}
        </div>
    );
}

export default App;
