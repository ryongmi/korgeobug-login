import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/user/auth.service';

@Injectable()
export class SeederService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  private readonly logger = new Logger('SEEDER');

  async seed() {
    const users = [
      {
        user_id: 'testUser',
        password: 'testUser',
        name: 'testUser',
        nickname: 'user',
        email: 'user@example.com',
      },
      {
        user_id: 'testAdmin',
        password: 'testAdmin',
        name: 'testAdmin',
        nickname: 'admin',
        email: 'admin@example.com',
      },
    ];

    this.logger.log('초기 데이터 세팅 시작');

    for (const user of users) {
      // const existingUser = await this.userRepository.findOne({
      //   where: { email: user.email },
      // });
      const existingUser = await this.userService.findByUserIdOREmail(
        user.user_id,
        user.email,
        'K',
      );

      if (existingUser.length === 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          await this.authService.signup(queryRunner.manager, user);
          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
        } finally {
          if (!queryRunner.isReleased) {
            await queryRunner.release();
          }
        }
      }
    }

    this.logger.log('초기 데이터 세팅 끝');
  }
}
