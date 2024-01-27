export type lable = "Species" | "Disease" | "Chemicals";
export type relation = "positive" | "negative" | "neutral";

export interface Neo4jEntry {
    label1: lable;
    label2: lable;
    relation: relation;
    entity1: string;
    entity2: string;
    score: number; 
    PMC_ID: string;
    sent_id: number; 
    sentence: string;
}