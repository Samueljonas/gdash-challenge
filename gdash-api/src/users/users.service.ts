import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // cryptography library for hashing passwords
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async onModuleInit() {
    const adminEmail = 'admin@gdash.com';
    const existingAdmin = await this.userModel.findOne({ email: adminEmail });

    if (!existingAdmin) {
      // Cria do zero se não existir
      console.log('⚡ Criando usuário ADMIN padrão...');
      const passwordHash = await bcrypt.hash('123456', 10);
      await this.userModel.create({
        email: adminEmail,
        password: passwordHash,
        name: 'Administrador GDash',
        role: 'admin', // <--- Define como ADMIN
      });
    } else {
      // (Opcional) Se já existe, garante que ele vire admin
      // Isso corrige seu banco atual sem precisar deletar tudo
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('⚡ Usuário Admin atualizado com permissão de chefe.');
      }
    }
  }

  // user create
  async create(createUserDto: CreateUserDto) {
    // 1. Encrypt the password before saving
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    // 2. Replace the original password with the hash
    const newUser = new this.userModel({
      ...createUserDto,
      password: hash,
    });

    return newUser.save();
  }

  // fetch user by email
  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findAll() {
    // Selects all users but excludes (-password) the hash for security
    return this.userModel.find().select('-password').exec();
  }
  async remove(id: string) {
    // Mongoose method to find and delete in one go
    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
