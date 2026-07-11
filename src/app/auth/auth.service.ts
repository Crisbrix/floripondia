import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  email: string;
  nombre: string;
  role: 'cliente' | 'vendedor' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionKey = 'flo_session';
  private tokenKey = 'flo_token';
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSession(): User | null {
    const raw = localStorage.getItem(this.sessionKey);
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.api}/auth/login`, { email, password })
      );
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.sessionKey, JSON.stringify(res.user));
      return res.user;
    } catch {
      return null;
    }
  }

  async register(email: string, nombre: string, password: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${this.api}/auth/register`, { email, nombre, password })
      );
      return true;
    } catch {
      return false;
    }
  }

  async createUser(email: string, nombre: string, password: string, role: 'vendedor' | 'admin'): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${this.api}/auth/register-admin`, { email, nombre, password, role })
      );
      return true;
    } catch {
      return false;
    }
  }

  async getAllUsers(): Promise<(User & { password?: string })[]> {
    try {
      const res: any = await firstValueFrom(this.http.get(`${this.api}/usuarios`));
      return res;
    } catch {
      return [];
    }
  }

  async updateProfile(nombre: string, password?: string): Promise<boolean> {
    try {
      const body: any = { nombre };
      if (password) body.password = password;
      await firstValueFrom(this.http.patch(`${this.api}/auth/perfil`, body));
      const session = this.getSession();
      if (session) {
        session.nombre = nombre;
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
      }
      return true;
    } catch {
      return false;
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.sessionKey);
  }
}
