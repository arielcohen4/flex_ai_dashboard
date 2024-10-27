export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      checkpoints: {
        Row: {
          created_at: string
          gguf_conversion_stage:
            | Database["public"]["Enums"]["GGUF_CONVERSION_STAGE"]
            | null
          gguf_storage_key: string | null
          id: string
          inference_cached: boolean
          logs: Json | null
          size: number | null
          stage: Database["public"]["Enums"]["CHECKPOINT_STAGE"]
          step: number
          storage_key: string | null
          task_id: string
          type: Database["public"]["Enums"]["CHECKPOINT_TYPE"]
          updated_at: string
          user_id: string
          volume_path: string
        }
        Insert: {
          created_at?: string
          gguf_conversion_stage?:
            | Database["public"]["Enums"]["GGUF_CONVERSION_STAGE"]
            | null
          gguf_storage_key?: string | null
          id?: string
          inference_cached?: boolean
          logs?: Json | null
          size?: number | null
          stage?: Database["public"]["Enums"]["CHECKPOINT_STAGE"]
          step: number
          storage_key?: string | null
          task_id: string
          type: Database["public"]["Enums"]["CHECKPOINT_TYPE"]
          updated_at?: string
          user_id: string
          volume_path: string
        }
        Update: {
          created_at?: string
          gguf_conversion_stage?:
            | Database["public"]["Enums"]["GGUF_CONVERSION_STAGE"]
            | null
          gguf_storage_key?: string | null
          id?: string
          inference_cached?: boolean
          logs?: Json | null
          size?: number | null
          stage?: Database["public"]["Enums"]["CHECKPOINT_STAGE"]
          step?: number
          storage_key?: string | null
          task_id?: string
          type?: Database["public"]["Enums"]["CHECKPOINT_TYPE"]
          updated_at?: string
          user_id?: string
          volume_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_task_id_fkey1"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      computes: {
        Row: {
          gpus_count: number | null
          id: string
          identifier: string
          name: string
          price_per_second: number
          type: Database["public"]["Enums"]["COMPUTE_TYPE"]
        }
        Insert: {
          gpus_count?: number | null
          id?: string
          identifier?: string
          name?: string
          price_per_second: number
          type?: Database["public"]["Enums"]["COMPUTE_TYPE"]
        }
        Update: {
          gpus_count?: number | null
          id?: string
          identifier?: string
          name?: string
          price_per_second?: number
          type?: Database["public"]["Enums"]["COMPUTE_TYPE"]
        }
        Relationships: []
      }
      datasets: {
        Row: {
          created_at: string
          eval_path: string | null
          eval_rows_count: number | null
          id: string
          is_archived: boolean
          max_tokens: number
          name: string
          storage_type: Database["public"]["Enums"]["STORAGE_TYPE"]
          total_tokens: number
          train_path: string
          train_rows_count: number
          type: Database["public"]["Enums"]["DATASET_TYPE"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          eval_path?: string | null
          eval_rows_count?: number | null
          id?: string
          is_archived?: boolean
          max_tokens: number
          name: string
          storage_type?: Database["public"]["Enums"]["STORAGE_TYPE"]
          total_tokens: number
          train_path: string
          train_rows_count: number
          type: Database["public"]["Enums"]["DATASET_TYPE"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          eval_path?: string | null
          eval_rows_count?: number | null
          id?: string
          is_archived?: boolean
          max_tokens?: number
          name?: string
          storage_type?: Database["public"]["Enums"]["STORAGE_TYPE"]
          total_tokens?: number
          train_path?: string
          train_rows_count?: number
          type?: Database["public"]["Enums"]["DATASET_TYPE"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      endpoints: {
        Row: {
          base_model_id: string
          checkpoint_id: string | null
          compute: string
          created_at: string
          id: string
          inference_library: Database["public"]["Enums"]["INFERENCE_LIBRARY"]
          is_archived: boolean | null
          lora_checkpoints: Json | null
          model_name: string | null
          name: string
          stage: Database["public"]["Enums"]["ENDPOINT_STAGE"]
          type: Database["public"]["Enums"]["CHECKPOINT_TYPE"]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          base_model_id: string
          checkpoint_id?: string | null
          compute?: string
          created_at?: string
          id?: string
          inference_library: Database["public"]["Enums"]["INFERENCE_LIBRARY"]
          is_archived?: boolean | null
          lora_checkpoints?: Json | null
          model_name?: string | null
          name: string
          stage?: Database["public"]["Enums"]["ENDPOINT_STAGE"]
          type: Database["public"]["Enums"]["CHECKPOINT_TYPE"]
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          base_model_id?: string
          checkpoint_id?: string | null
          compute?: string
          created_at?: string
          id?: string
          inference_library?: Database["public"]["Enums"]["INFERENCE_LIBRARY"]
          is_archived?: boolean | null
          lora_checkpoints?: Json | null
          model_name?: string | null
          name?: string
          stage?: Database["public"]["Enums"]["ENDPOINT_STAGE"]
          type?: Database["public"]["Enums"]["CHECKPOINT_TYPE"]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "endpoints_base_model_id_fkey"
            columns: ["base_model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endpoints_compute_fkey"
            columns: ["compute"]
            isOneToOne: false
            referencedRelation: "computes"
            referencedColumns: ["id"]
          },
        ]
      }
      endpoints_sessions: {
        Row: {
          cost: number | null
          end_time: string | null
          endpoint_id: string
          id: string
          is_balance_updated: boolean
          start_time: string
          total_seconds: number | null
          user_id: string
        }
        Insert: {
          cost?: number | null
          end_time?: string | null
          endpoint_id: string
          id?: string
          is_balance_updated?: boolean
          start_time: string
          total_seconds?: number | null
          user_id: string
        }
        Update: {
          cost?: number | null
          end_time?: string | null
          endpoint_id?: string
          id?: string
          is_balance_updated?: boolean
          start_time?: string
          total_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "endpoints_sessions_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          context_length: number
          created_at: string
          default_config: Json
          family: string | null
          fft_compute: string
          fft_compute_batch_size: number
          id: string
          inference_cached: boolean
          inference_cached_path: string | null
          lora_compute: string
          lora_compute_batch_size: number
          min_subscription_level: number
          model_class: string
          name: string
          params_count: number
          vllm_context_length: number | null
          vllm_lora_context_length: number | null
          vllm_lora_support: boolean
          vllm_support: boolean
        }
        Insert: {
          context_length: number
          created_at?: string
          default_config: Json
          family?: string | null
          fft_compute?: string
          fft_compute_batch_size?: number
          id?: string
          inference_cached?: boolean
          inference_cached_path?: string | null
          lora_compute?: string
          lora_compute_batch_size?: number
          min_subscription_level?: number
          model_class?: string
          name?: string
          params_count: number
          vllm_context_length?: number | null
          vllm_lora_context_length?: number | null
          vllm_lora_support: boolean
          vllm_support: boolean
        }
        Update: {
          context_length?: number
          created_at?: string
          default_config?: Json
          family?: string | null
          fft_compute?: string
          fft_compute_batch_size?: number
          id?: string
          inference_cached?: boolean
          inference_cached_path?: string | null
          lora_compute?: string
          lora_compute_batch_size?: number
          min_subscription_level?: number
          model_class?: string
          name?: string
          params_count?: number
          vllm_context_length?: number | null
          vllm_lora_context_length?: number | null
          vllm_lora_support?: boolean
          vllm_support?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "models_fft_compute_fkey"
            columns: ["fft_compute"]
            isOneToOne: false
            referencedRelation: "computes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "models_lora_compute_fkey"
            columns: ["lora_compute"]
            isOneToOne: false
            referencedRelation: "computes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          api_key: string
          aws_access_key_id: string | null
          aws_bucket: string | null
          aws_region: Database["public"]["Enums"]["AWS_REGION"] | null
          aws_secret_access_key: string | null
          balance: number
          created_at: string
          display_name: string | null
          email: string
          id: string
          image_url: string | null
          is_aws_s3: boolean
          is_first_sign: boolean
          subscription_level: number
          wandb_key: string | null
        }
        Insert: {
          api_key?: string
          aws_access_key_id?: string | null
          aws_bucket?: string | null
          aws_region?: Database["public"]["Enums"]["AWS_REGION"] | null
          aws_secret_access_key?: string | null
          balance?: number
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          image_url?: string | null
          is_aws_s3?: boolean
          is_first_sign?: boolean
          subscription_level?: number
          wandb_key?: string | null
        }
        Update: {
          api_key?: string
          aws_access_key_id?: string | null
          aws_bucket?: string | null
          aws_region?: Database["public"]["Enums"]["AWS_REGION"] | null
          aws_secret_access_key?: string | null
          balance?: number
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          image_url?: string | null
          is_aws_s3?: boolean
          is_first_sign?: boolean
          subscription_level?: number
          wandb_key?: string | null
        }
        Relationships: []
      }
      subscription: {
        Row: {
          created_at: string
          customer_id: string | null
          email: string
          end_at: string | null
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          email: string
          end_at?: string | null
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          email?: string
          end_at?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_subscription_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["email"]
          },
        ]
      }
      tasks: {
        Row: {
          checkpoints_count: number
          compute: string
          compute_data: Json | null
          config: Json
          cost: number | null
          created_at: string
          current_epoch: number | null
          current_step: number | null
          dataset_id: string
          end_time: string | null
          error_string: string | null
          id: string
          is_balance_updated: boolean
          model_id: string
          name: string
          stage: Database["public"]["Enums"]["TASK_STAGE"]
          start_time: string | null
          start_train_time: string | null
          total_steps: number
          updated_at: string
          user_id: string
          wandb_url: string | null
        }
        Insert: {
          checkpoints_count: number
          compute: string
          compute_data?: Json | null
          config: Json
          cost?: number | null
          created_at?: string
          current_epoch?: number | null
          current_step?: number | null
          dataset_id: string
          end_time?: string | null
          error_string?: string | null
          id?: string
          is_balance_updated?: boolean
          model_id: string
          name: string
          stage?: Database["public"]["Enums"]["TASK_STAGE"]
          start_time?: string | null
          start_train_time?: string | null
          total_steps: number
          updated_at?: string
          user_id: string
          wandb_url?: string | null
        }
        Update: {
          checkpoints_count?: number
          compute?: string
          compute_data?: Json | null
          config?: Json
          cost?: number | null
          created_at?: string
          current_epoch?: number | null
          current_step?: number | null
          dataset_id?: string
          end_time?: string | null
          error_string?: string | null
          id?: string
          is_balance_updated?: boolean
          model_id?: string
          name?: string
          stage?: Database["public"]["Enums"]["TASK_STAGE"]
          start_time?: string | null
          start_train_time?: string | null
          total_steps?: number
          updated_at?: string
          user_id?: string
          wandb_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_compute_fkey"
            columns: ["compute"]
            isOneToOne: false
            referencedRelation: "computes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_sub_active: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_balance_and_session: {
        Args: {
          p_user_id: string
          p_session_id: string
          p_cost: number
        }
        Returns: undefined
      }
      update_balance_and_task: {
        Args: {
          p_user_id: string
          p_task_id: string
          p_cost: number
        }
        Returns: undefined
      }
    }
    Enums: {
      AWS_REGION:
        | "us-east-1"
        | "us-east-2"
        | "us-west-1"
        | "us-west-2"
        | "eu-west-1"
        | "eu-central-1"
        | "ap-southeast-1"
        | "ap-southeast-2"
        | "ap-northeast-1"
        | "sa-east-1"
      CHECKPOINT_STAGE: "PENDING" | "ARCHIVING" | "UPLOADING" | "FINISHED"
      CHECKPOINT_TYPE: "LORA" | "REGULAR"
      COMPUTE_TYPE: "RUNPOD" | "MODAL"
      DATASET_TYPE: "TEXT" | "INSTRUCTION" | "CHAT"
      ENDPOINT_STAGE: "INITIALIZING" | "LIVE"
      GGUF_CONVERSION_STAGE:
        | "PENDING"
        | "DOWNLOADING"
        | "CONVERTING"
        | "ARCHIVING"
        | "UPLOADING"
        | "FINISHED"
      INFERENCE_LIBRARY: "VLLM"
      STORAGE_TYPE: "FLEX" | "AWS"
      TASK_STAGE:
        | "DOWNLOADING_MODEL"
        | "DOWNLOADING_DATA"
        | "TRAINING"
        | "COMPLETED"
        | "ERRORED"
        | "PENDING"
        | "CANCELED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
