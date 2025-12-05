import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // cryptography library for hashing passwords
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // --- SEED: CRIAR USUÁRIO PADRÃO AO INICIAR ---
  async onModuleInit() {
    const adminEmail = 'admin@gdash.com';
    const exists = await this.userModel.findOne({ email: adminEmail });

    if (!exists) {
      console.log('⚡ Criando usuário ADMIN padrão...');
      // Senha padrão: "123456"
      // O "10" é o custo do processamento (Salt rounds)
      const passwordHash = await bcrypt.hash('123456', 10);

      await this.userModel.create({
        email: adminEmail,
        password: passwordHash,
        name: 'Administrador GDash',
      });
      console.log(' Usuário ADMIN criado com sucesso!');
    }
  }

  // user create
  async create(createUserDto: CreateUserDto) {
    // 1. Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    // 2. Substitui a senha original pelo hash
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
    // return all users without passwords
    return this.userModel.find().select('-password').exec();
  }
}
