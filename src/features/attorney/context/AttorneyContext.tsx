import { AttorneySubject } from '@/src/features/attorney/types';
import React, { createContext, useContext, useState } from 'react';

interface AttorneyContextType {
  receiverEmail: string;
  setReceiverEmail: (val: string) => void;
  startDate: Date | undefined;
  setStartDate: (val: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (val: Date | undefined) => void;
  allSubjects: boolean;
  setAllSubjects: (val: boolean) => void;
  selectedSubjectIds: number[];
  setSelectedSubjectIds: (val: number[]) => void;
  availableSubjects: AttorneySubject[];
  setAvailableSubjects: (val: AttorneySubject[]) => void;
  resetForm: () => void;
}

const AttorneyContext = createContext<AttorneyContextType | undefined>(undefined);

export const AttorneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [allSubjects, setAllSubjects] = useState(true);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<AttorneySubject[]>([]);

  const resetForm = () => {
    setReceiverEmail('');
    setStartDate(undefined);
    setEndDate(undefined);
    setAllSubjects(true);
    setSelectedSubjectIds([]);
  };

  return (
    <AttorneyContext.Provider
      value={{
        receiverEmail, setReceiverEmail,
        startDate, setStartDate,
        endDate, setEndDate,
        allSubjects, setAllSubjects,
        selectedSubjectIds, setSelectedSubjectIds,
        availableSubjects, setAvailableSubjects,
        resetForm,
      }}
    >
      {children}
    </AttorneyContext.Provider>
  );
};

export const useAttorney = () => {
  const context = useContext(AttorneyContext);
  if (!context) throw new Error('useAttorney must be used within an AttorneyProvider');
  return context;
};
