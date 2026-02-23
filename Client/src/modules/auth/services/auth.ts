<<<<<<< HEAD
=======
import apiClient from "@/api/apiClient";
>>>>>>> Temp-fixed
//added new client
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}
