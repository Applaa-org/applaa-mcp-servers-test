interface SQLiteMCP {
  createTable: (params: {
    tableName: string;
    schema: string;
  }) => Promise<void>;
  
  insertData: (params: {
    tableName: string;
    data: Record<string, any>;
  }) => Promise<{ id: number }>;
  
  updateData: (params: {
    tableName: string;
    data: Record<string, any>;
    where: Record<string, any>;
  }) => Promise<void>;
  
  deleteData: (params: {
    tableName: string;
    where: Record<string, any>;
  }) => Promise<void>;
  
  queryData: (params: {
    query: string;
    params: any[];
  }) => Promise<any[]>;
}

interface Window {
  sqlite: SQLiteMCP;
}