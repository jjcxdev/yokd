export type ValidType = 'cable' | 'machine' | 'dumbbell';

export interface Exercise{
    id: string,
    name: string,
    muscleGroup:string,
    type:ValidType,
    isCustom:number;
    createdBy: string | null;
    createdAt: number,
}