const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
// const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate('books');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('books');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      // const token = signToken(user);
      return { user };
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

      // const token = signToken(user);

      return { user };
    },
    addBook: async (parent, { text, author, title }) => {

      await User.findOneAndUpdate(
        { username: username },
        { $addToSet: { books: {_id:ID, text: text, author: author, title: title} } }
      );

    },
    
    removeBook: async (parent, { userId, bookId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { books: { _id: bookId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
