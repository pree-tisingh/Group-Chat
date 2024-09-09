const Message = require('../models/Message'); // Ensure correct import
const User = require('../models/User');
console.log('User model:', User);

exports.getMessages = async (req, res) => {
    const { userId } = req.params; // Assuming you're passing the userId

    try {
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
  
      // Fetch messages using the alias 'messages'
      const messages = await Message.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: 'user', // Use the alias defined in the association
            attributes: ['name'], // Fetch the user's name along with the message
          },
        ],
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  exports.sendMessage = async (req, res) => {
    try {
      const { message, userId } = req.body;
      console.log('Received userId:', userId); // Add this line
  
      if (!message || !userId) {
        return res.status(400).json({ error: 'Message and User ID are required' });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const newMessage = await Message.create({
        message,
        userId,
      });
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error processing message:', error.message);
      console.error('Error stack trace:', error.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  

