import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser).catch(() => {
      throw new BadRequestException(`사용자를 생성하는데 실패하였습니다.`);
    });
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const userById = await this.userRepository.findOne(id);
    if (!userById) {
      throw new NotFoundException(`사용자를 찾을수 없습니다. Name: ${id}`);
    }
    return userById;
  }

  async findByName(name: string) {
    const user = await this.userRepository.findOne({ name });
    if (!user) {
      throw new NotFoundException(`사용자를 찾을수 없습니다. Name: ${name}`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.findOne(id)
      .then((user) => {
        const updateUser = { ...user, ...updateUserDto };
        return this.userRepository.save(updateUser);
      })
      .catch((err) => {
        this.logger.error(`User Update Error cause ${err}`);
        throw new BadRequestException(
          `사용자를 업데이트 하는데 실패하였습니다.`,
        );
      });
  }

  async remove(id: string) {
    return this.findOne(id)
      .then((user) => {
        return this.userRepository.softRemove(user);
      })
      .catch((err) => {
        this.logger.error(`User Remove Error cause ${err}`);
        throw new BadRequestException(`사용자를 삭제 하는데 실패하였습니다.`);
      });
  }
}
