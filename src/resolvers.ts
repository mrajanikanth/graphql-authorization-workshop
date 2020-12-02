import db, { Post, User, Role } from './database';
import { createUserToken, isTokenValid } from './authentication';

function getUsers(): Array<User> {
  const users = Array.from(db.users.values());

  return users;
}

function getPosts(_: Object, {}, { isAuthenticated, user }): Array<Post> {
  const posts = Array.from(db.posts.values());

  if (!isAuthenticated) {
    return posts.filter(({ published }) => published === true);
  }

  return posts.map((post) => ({
    ...post,
    views: user.role === Role.Admin ? post.views : null,
  }));
}

function getPostsByUser({ id }: User): Array<Post> {
  const posts = Array.from(db.posts.values());

  return posts.filter(({ authorId }) => authorId === id);
}

function getAuthorForPost({ authorId }: Post): User | null {
  return db.users.get(authorId);
}

function computeName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

const resolvers = {
  User: {
    name: computeName,
    posts: getPostsByUser,
  },
  Post: {
    author: getAuthorForPost,
  },
  Query: {
    users: getUsers,
    posts: getPosts,
  },
  Mutation: {
    loginUser: createUserToken,
  },
};

export default resolvers;
