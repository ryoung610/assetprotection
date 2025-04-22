import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
//import { type InferSchemaFrom, a, defineData } from '@aws-amplify/backend';



export const schema = a.schema({
  Group: a
    .model({
      name: a.string().required(),
      creatorId: a.id().required(),
      isPrivate: a.boolean(),
      messages: a.hasMany("Message", "groupId"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
    ]),

  User: a
    .model({
      id: a.id().required(),
      username: a.string().required(),
      email: a.email().required(),
      profilePicture: a.string(),
      senderId: a.id().required(),
      messages: a.hasMany("Message", "senderId"),
      name: a.string().required(),
      employeeId: a.string().required(),
      storeLocation: a.string().required(),
      role: a.enum(['MANAGER', 'EMPLOYEE', 'ADMIN']),
      shift: a.string().required(),
      approved: a.boolean().required(),
      avatar: a.string(),
      assignedTasks: a.hasMany("Task", "assignedTo"),
      createdTasks: a.hasMany("Task", "assignedBy"),
      reportedIncidents: a.hasMany("Incident", "reportedBy"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
    ]),

  Message: a
    .model({
      content: a.string(),
      mediaUrl: a.string(),
      groupId: a.id().required(),
      group: a.belongsTo("Group", "groupId"),
      senderId: a.id().required(),
      sender: a.belongsTo("User", "senderId"),
      sentAt: a.datetime().required(),
      senderName: a.string().required(),
      tags: a.string().array(),
      mentions: a.string().array(),
      attachments: a.json(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
      allow.groups(["MANAGER"]).to(["read", "delete"]),
    ]),

  ResourceItem: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      category: a.string().required(),
      type: a.enum(['profile', 'guide', 'policy', 'hotlist', 'map', 'training']),
      thumbnail: a.string(),
      url: a.string(),
      tags: a.string().array(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.groups(["MANAGER", "ADMIN"]).to(["create", "update", "delete"]),
    ]),

  Task: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      assignedTo: a.id().required(),
      assignedBy: a.id().required(),
      dueDate: a.datetime().required(),
      completed: a.boolean().required(),
      storeLocation: a.string().required(),
      assignee: a.belongsTo("User", "assignedTo"),
      creator: a.belongsTo("User", "assignedBy"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.groups(["MANAGER"]).to(["create", "update", "delete"]),
    ]),

  Incident: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      location: a.string().required(),
      timestamp: a.datetime().required(),
      reportedBy: a.id().required(),
      parties: a.string().array().required(),
      status: a.enum(['pending', 'investigating', 'resolved']),
      attachments: a.json(),
      reporter: a.belongsTo("User", "reportedBy"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.groups(["MANAGER"]).to(["create", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

// Manually define model types to avoid Schema['models'] errors
export type Group = {
  id: string;
  name: string;
  creatorId: string;
  isPrivate?: boolean;
  messages?: Message[];
};

export type User = {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  senderId: string;
  messages?: Message[];
  name: string;
  employeeId: string;
  storeLocation: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'ADMIN';
  shift: string;
  approved: boolean;
  avatar?: string;
  assignedTasks?: Task[];
  createdTasks?: Task[];
  reportedIncidents?: Incident[];
};

export type Message = {
  id: string;
  content?: string;
  mediaUrl?: string;
  groupId: string;
  group?: Group;
  senderId: string;
  sender?: User;
  sentAt: string;
  senderName: string;
  tags?: string[];
  mentions?: string[];
  attachments?: any;
  createdAt?: string;
  updatedAt?: string;
};

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'profile' | 'guide' | 'policy' | 'hotlist' | 'map' | 'training';
  thumbnail?: string;
  url?: string;
  tags?: string[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  completed: boolean;
  storeLocation: string;
  assignee?: User;
  creator?: User;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  reportedBy: string;
  parties: string[];
  status: 'pending' | 'investigating' | 'resolved';
  attachments?: any;
  reporter?: User;
};


export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // ✅ No apiKey needed
  },
});
