export interface AttorneySubject {
  id: number;
  name: string;
}

export interface Attorney {
  id: string;
  receiverEmail: string;
  giverEmail: string;
  startDate: string;
  endDate: string;
  allSubjects: boolean;
  subjects: AttorneySubject[];
  active: boolean;
  deleted: boolean;
}

export interface CreateAttorneyPayload {
  receiverEmail: string;
  startDate: Date;
  endDate: Date;
  allSubjects: boolean;
  selectedSubjectIds: number[];
}
