export enum Label {
    SPECIES="Species",
    DISEASE="Disease", 
    CHEMICALS="Chemicals",
}
  
export enum Relation {
    POSITIVE="positive",
    NEGATIVE="negative",
    NEUTRAL="neutral",
}

export interface Neo4jEntry {
    label1: Label;
    label2: Label;
    relation: Relation;
    entity1: string;
    entity2: string;
    score: number; 
    PMC_ID: string;
    sent_id: number; 
    sentence: string;
}