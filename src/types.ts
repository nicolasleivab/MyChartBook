import { Request } from 'express';
import mongoose from 'mongoose';

export interface IUser {
  username: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  date?: Date;
}

export interface IUserId extends IUser {
  id: string;
}

export interface IEducation {
  school: string;
  degree: string;
  fieldOfStudy: string;
  year: Date;
}
export interface IExperience {
  title: string;
  company: string;
  location: string;
  from: Date;
  to: Date;
  current: boolean;
  description: string;
}

export interface ISocial {
  twitter: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface IProfileFields {
  user: string | number;
  company: string;
  website: string;
  location: string;
  status: string;
  skills: string;
  bio: string;
  experience: IExperience;
  education: IEducation;
  social: ISocial;
}

interface IUserObject {
  user: mongoose.Schema.Types.ObjectId;
}

interface IComment {
  user: IUserObject;
  text: string;
  name: string;
  avatar: string;
  date: Date;
}

export interface IPost {
  user: IUserObject;
  text: string;
  username: string;
  avatar: string;
  likes: IUserObject[];
  comments: IComment[];
  date: Date;
}

interface IParams {
  [key: string]: string;
  id: string;
  user_id: string;
  exp_id: string;
  edu_id: string;
  commnet_id: string;
}

export interface BodyRequest<T> extends Request {
  body: T;
}

export interface UserRequest<T> extends Request {
  user: T;
}

export interface ParamsRequest extends Request {
  params: IParams;
}
