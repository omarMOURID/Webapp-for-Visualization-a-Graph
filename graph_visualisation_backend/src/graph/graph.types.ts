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

// Function to check if a given label is valid based on the Label enum
export const isValidLabel = (label: any): label is Label => Object.values(Label).includes(label);

// Function to check if a given relation is valid based on the Relation enum
export const isValidRelation = (relation: any): relation is Relation => Object.values(Relation).includes(relation);

/**
 * Function to validate whether an object conforms to the Neo4jEntry interface.
 * @param obj - The object to be validated.
 * @returns True if the object is a valid Neo4jEntry, false otherwise.
 */
export function isNeo4jEntry(obj: any): obj is Neo4jEntry {
    // Check if the object is not null or undefined
    if (!obj) {
        return false;
    }

    // Validate individual properties of the Neo4jEntry object
    return (
        isValidLabel(obj.label1) &&
        isValidLabel(obj.label2) &&
        isValidRelation(obj.relation) &&
        typeof obj.entity1 === 'string' &&
        typeof obj.entity2 === 'string' &&
        typeof obj.score === 'number' &&
        typeof obj.PMC_ID === 'string' &&
        typeof obj.sent_id === 'number' &&
        typeof obj.sentence === 'string'
    );
}