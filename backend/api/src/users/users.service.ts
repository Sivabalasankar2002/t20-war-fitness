import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

    findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email } });
    }

    findById(id: string) {
        return this.usersRepo.findOne({ where: { id } });
    }

    async findAll(page?: number, limit?: number) {
        const qb = this.usersRepo.createQueryBuilder('u').orderBy('u.created_at', 'DESC');
        if (page || limit) {
            const p = page && page > 0 ? page : 1;
            const l = limit && limit > 0 ? Math.min(limit, 100) : 10;
            qb.skip((p - 1) * l).take(l);
            const [data, total] = await qb.getManyAndCount();
            return { data, total, page: p, limit: l };
        }
        return qb.getMany();
    }

    create(data: Pick<User, 'email' | 'passwordHash' | 'role'>) {
        const user = this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }
}


