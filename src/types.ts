import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: { [key: string]: string | number };
}

export interface RequestWithBody extends Request {
  body: { [key: string]: string };
}

export interface RequestWithParams extends Request {
  params: { [key: string]: string };
}

export interface RequestUserAndParams
  extends RequestWithUser,
    RequestWithParams {}

export interface RequestUserAndBody extends Request {
  user: { [key: string]: string | number };
  body: { [key: string]: string };
}

export interface RequestUserBodyAndParams extends Request {
  user: { [key: string]: string | number };
  body: { [key: string]: string };
  params: { [key: string]: string };
}

export interface ProfileFields {
  user: string | number;
  company: string;
  website: string;
  location: string;
  status: string;
  skills: string;
  bio: string;
  experience: {};
  education: {};
  social: {};
}
