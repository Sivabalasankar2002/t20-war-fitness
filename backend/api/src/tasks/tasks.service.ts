import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Member, MemberStatus } from '../members/member.entity';
import { MembershipPeriod, PeriodStatus } from '../members/membership-period.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(MembershipPeriod)
    private readonly periodRepository: Repository<MembershipPeriod>,
  ) {}

  /**
   * Cron job that runs every 5 minutes to update member status
   * based on their membership expiry date
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateMemberStatus() {
    this.logger.log('Running scheduled task: Update member status');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    try {
      // Find members whose end date is today or earlier and status is not expired
      const expiredMembers = await this.memberRepository.find({
        where: {
          endDate: LessThanOrEqual(todayStr),
        },
      });
      
      if (expiredMembers.length > 0) {
        this.logger.log(`Found ${expiredMembers.length} members to mark as expired`);
        
        // Update each expired member
        for (const member of expiredMembers) {
          member.status = MemberStatus.EXPIRED;
          await this.memberRepository.save(member);
          
          // Also update any active membership periods to completed
          const activePeriods = await this.periodRepository.find({
            where: {
              member: { id: member.id },
              status: PeriodStatus.ACTIVE,
            },
          });
          
          for (const period of activePeriods) {
            period.status = PeriodStatus.COMPLETED;
            await this.periodRepository.save(period);
          }
        }
        
        this.logger.log(`Updated ${expiredMembers.length} members to expired status`);
      } else {
        this.logger.debug('No members to expire');
      }
      
      // Find members who will expire soon (in the next 7 days) and mark them as soon_to_expire
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];
      
      const soonToExpireMembers = await this.memberRepository.find({
        where: {
          endDate: LessThanOrEqual(sevenDaysLaterStr),
          status: MemberStatus.ACTIVE,
        },
      });
      
      // Filter out members that are already expired
      const validSoonToExpireMembers = soonToExpireMembers.filter(
        (member) => member.endDate > todayStr,
      );
      
      if (validSoonToExpireMembers.length > 0) {
        this.logger.log(`Found ${validSoonToExpireMembers.length} members to mark as soon to expire`);
        
        // Update each soon to expire member
        for (const member of validSoonToExpireMembers) {
          member.status = MemberStatus.SOON_TO_EXPIRE;
          await this.memberRepository.save(member);
        }
        
        this.logger.log(`Updated ${validSoonToExpireMembers.length} members to soon_to_expire status`);
      } else {
        this.logger.debug('No members to mark as soon to expire');
      }
    } catch (error) {
      this.logger.error(`Error updating member status: ${error.message}`, error.stack);
    }
  }
  
  /**
   * Manual method to update member status
   * Can be called from API if needed
   */
  async manualUpdateMemberStatus() {
    await this.updateMemberStatus();
    return { success: true, message: 'Member status update completed' };
  }
}
