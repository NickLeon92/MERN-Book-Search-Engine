const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate('savedBooks');
    },
    me: async (parent, { username }) => {
      if(context.user){
      return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return {token,  user };
    },
    saveBook: async (parent, { authors, description, bookId, image, link, title }, context) => {
      if(context.user){
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedbooks: { authors, description, bookId, image, link, title } } },
        {new:true}
      );
      }
      throw new AuthenticationError('Please log in to continue!')

    },
    
    removeBook: async (parent, { bookId }, context) => {
      if(context.user){
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedbooks: { bookId } } },
        { new: true }
      );
      }
      throw new AuthenticationError('Please log in to continue!')
    },


    
  },
};

module.exports = resolvers;
