import { ActorTypeEnum, IBasePerTenantAndOrganizationEntityModel, ID } from './base-entity.model';
import { IUser } from './user.model';

export interface IActivityLog extends IBasePerTenantAndOrganizationEntityModel {
	entity: ActivityLogEntityEnum; // Entity / Table name concerned by activity log
	entityId: ID; // The ID of the element we are interacting with (a task, an organization, an employee, ...)
	action: ActionTypeEnum;
	actorType?: ActorTypeEnum;
	description?: string; // A short sentence describing the action performed. (E.g John Doe created this on 22.09.2024)
	updatedFields?: string[]; // In case of update actions, which entity fields was modified simultaneously. Avoid multiple records. (E.g For task : ['name', 'members', 'projectId'])
	previousValues?: IActivityLogUpdatedValues[]; // Values before update (E.g For task : {title: ' First Task', members: ['Member1Name', 'Member2Name'], projectId: 'project1UUId'})
	updatedValues?: IActivityLogUpdatedValues[]; // Values after update (E.g For task : {title: ' First Task Updated', members: ['Member4Name', 'Member3Name'], projectId: 'project2UUId'})
	previousEntities?: IActivityLogUpdatedValues[]; // Stores previous IDs or other values for related entities. Eg : {members: ['member_1_ID', 'member_2_ID']}
	updatedEntities?: IActivityLogUpdatedValues[]; // Stores updated IDs, or other values for related entities. Eg : {members: ['member_1_ID', 'member_2_ID']},
	creator?: IUser;
	creatorId?: ID;
	data?: Record<string, any>;
}

export enum ActionTypeEnum {
	CREATED = 'Created',
	UPDATED = 'Updated',
	DELETED = 'Deleted'
}

export interface IActivityLogUpdatedValues {
	[x: string]: any;
}

export enum ActivityLogEntityEnum {
	Candidate = 'Candidate',
	Contact = 'Contact',
	Employee = 'Employee',
	Expense = 'Expense',
	DailyPlan = 'DailyPlan',
	Invoice = 'Invoice',
	Income = 'Income',
	Organization = 'Organization',
	OrganizationContact = 'OrganizationContact',
	OrganizationDepartment = 'OrganizationDepartment',
	OrganizationDocument = 'OrganizationDocument',
	OrganizationProject = 'OrganizationProject',
	OrganizationTeam = 'OrganizationTeam',
	OrganizationProjectModule = 'OrganizationProjectModule',
	OrganizationSprint = 'OrganizationSprint',
	Task = 'Task',
	User = 'User'
	// Add other entities as we can to use them for activity history
}

export interface IActivityLogCreateInput extends Omit<IActivityLog, 'creatorId' | 'creator'> {}
