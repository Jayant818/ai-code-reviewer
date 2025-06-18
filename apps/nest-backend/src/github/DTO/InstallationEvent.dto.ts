import { Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
} from "class-validator";
import {
  ACCOUNT_VALUES,
  IACCOUNT_TYPES,
  INSTALLATION_EVENTS,
  IPERMISSION_TYPE,
  PERMISSION_VALUES,
} from "src/common/enums";

class Account {
  @IsNumber()
  @IsNotEmpty()
  id: number;
    
  @IsString()
  @IsNotEmpty()
  login: string;
    
  

  @IsString()
  @IsNotEmpty()
  avatar_url: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsIn(ACCOUNT_VALUES)
  type: IACCOUNT_TYPES;
}

class Permission {
  @IsString()
  @IsIn(PERMISSION_VALUES)
  checks: IPERMISSION_TYPE;

  @IsString()
  @IsIn(PERMISSION_VALUES)
  contents: IPERMISSION_TYPE;

  @IsString()
  @IsIn(PERMISSION_VALUES)
  metadata: IPERMISSION_TYPE;

  @IsString()
  @IsIn(PERMISSION_VALUES)
  pull_requests: IPERMISSION_TYPE;
}

export class Installations {

  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ValidateNested()
  @Type(() => Account)
  account: Account;

  @ValidateNested()
  @Type(() => Permission)
  permissions: Permission;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) 
  events: string[];

  @IsString()
  @IsNotEmpty()
  created_at: string;
}

class Repository {
  @IsNumber()
  id: number;

  @IsString()
  node_id: string;

  @IsString()
  name: string;

  @IsString()
  full_name: string;

  @IsBoolean()
  private: boolean;
}

export class InstallationEventDTO {
  @IsString()
  @IsIn(Object.keys(INSTALLATION_EVENTS))
  action: string;

  @ValidateNested()
  @Type(() => Installations)
  installation: Installations;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Repository)
  repositories: Repository[];
}
