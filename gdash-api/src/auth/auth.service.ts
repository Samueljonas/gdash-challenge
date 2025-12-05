import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service'; // Importing the neighboring module
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // We inject the users service
    private jwtService: JwtService, // We inject the token generator
  ) {}
  // --- REGISTRATION FUNCTION ---
  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // --- LOGIN FUNCTION ---
  async login(loginDto: LoginDto) {
    // 1. Find the user by email
    const user = await this.usersService.findOneByEmail(loginDto.email);

    // 2. If the user doesn't exist, reject immediately
    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials (Email not found)',
      );
    }

    // 3. Password Comparison (The Moment of Truth)
    // bcrypt.compare(typed_password, hash_from_database)
    // It takes the typed password, applies the same algorithm, and checks if the result matches the hash.
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials (Incorrect password)',
      );
    }

    // 4. If it passed, let's generate the "Wristband" (Token)
    // The 'payload' is the content that will be written inside the encrypted token.
    const payload = { sub: user._id, email: user.email, name: user.name };

    return {
      access_token: await this.jwtService.signAsync(payload), // Digitally signs the token
      user: {
        // We return basic data for the frontend to know who logged in
        name: user.name,
        email: user.email,
      },
    };
  }
}
