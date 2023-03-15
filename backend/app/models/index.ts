import { EnrollmentModel } from './enrollment.model';
import { CalendarModel } from './calendar.model';
import { InvitationModel } from './invitation.model';
import { ClassRecordModel } from './class-record.model';
import { LevelModel } from './level.model';
import { UserProfileModel, UserWithSubscription } from './user-profile.model';
import { LessonModel } from './lesson.model';
import { ProgramModel } from './program.model';
import { ModuleModel } from './module.model';
import { StudyGroupModel } from './study-group.model';
import { InvoiceModel } from './invoice.model';
import { ClassroomModel } from './classroom.model';
import { AdminModel } from './admin.model';
import { ProductModel } from './product.model';
import { SubscriptionModel } from './subscription.model';
import { DashboardModel } from './dashboard-model';
import { UserTutorial } from './user-tutorial.model';

export interface EsloModels {
    program: ProgramModel;
    module: ModuleModel;
    level: LevelModel;
    lesson: LessonModel;
    invitation: InvitationModel;
    enrollment: EnrollmentModel;
    studyGroup: StudyGroupModel;
    classRecord: ClassRecordModel;
    calendar: CalendarModel;
    user: UserProfileModel;
    invoice: InvoiceModel;
    classroom: ClassroomModel;
    admin: AdminModel;
    product: ProductModel;
    subscription: SubscriptionModel;
    dashboard: DashboardModel;
    userTutorial: UserTutorial;
}

export function createModels(loggedUser: UserWithSubscription): EsloModels {
    return {
        program: new ProgramModel(loggedUser),
        module: new ModuleModel(loggedUser),
        level: new LevelModel(loggedUser),
        lesson: new LessonModel(loggedUser),
        invitation: new InvitationModel(loggedUser),
        enrollment: new EnrollmentModel(loggedUser),
        studyGroup: new StudyGroupModel(loggedUser),
        classRecord: new ClassRecordModel(loggedUser),
        calendar: new CalendarModel(loggedUser),
        user: new UserProfileModel(loggedUser),
        invoice: new InvoiceModel(loggedUser),
        classroom: new ClassroomModel(loggedUser),
        admin: new AdminModel(loggedUser),
        product: new ProductModel(loggedUser),
        subscription: new SubscriptionModel(loggedUser),
        dashboard: new DashboardModel(loggedUser),
        userTutorial: new UserTutorial(loggedUser),
    };
}
