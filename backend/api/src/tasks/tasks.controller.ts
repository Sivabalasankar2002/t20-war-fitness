import { Controller, Post, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('update-member-status')
  @Roles(UserRole.ADMIN)
  updateMemberStatus() {
    return this.tasksService.manualUpdateMemberStatus();
  }
}
