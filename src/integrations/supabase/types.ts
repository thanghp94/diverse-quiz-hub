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
      content: {
        Row: {
          challengesubject: string[] | null
          contentgroup: string | null
          dk_loc: string | null
          dk_loc_2: string | null
          hanh_dong: string | null
          id: string
          imageid: string | null
          information: string | null
          Order: number | null
          parentid: string | null
          prompt: string | null
          second_short_blurb: string | null
          short_blurb: string | null
          short_description: string | null
          title: string
          topicid: number | null
          Translation: string | null
          update: string | null
          url: string | null
          videoid: string | null
          videoid2: string | null
          vocabulary: string | null
        }
        Insert: {
          challengesubject?: string[] | null
          contentgroup?: string | null
          dk_loc?: string | null
          dk_loc_2?: string | null
          hanh_dong?: string | null
          id: string
          imageid?: string | null
          information?: string | null
          Order?: number | null
          parentid?: string | null
          prompt?: string | null
          second_short_blurb?: string | null
          short_blurb?: string | null
          short_description?: string | null
          title: string
          topicid?: number | null
          Translation?: string | null
          update?: string | null
          url?: string | null
          videoid?: string | null
          videoid2?: string | null
          vocabulary?: string | null
        }
        Update: {
          challengesubject?: string[] | null
          contentgroup?: string | null
          dk_loc?: string | null
          dk_loc_2?: string | null
          hanh_dong?: string | null
          id?: string
          imageid?: string | null
          information?: string | null
          Order?: number | null
          parentid?: string | null
          prompt?: string | null
          second_short_blurb?: string | null
          short_blurb?: string | null
          short_description?: string | null
          title?: string
          topicid?: number | null
          Translation?: string | null
          update?: string | null
          url?: string | null
          videoid?: string | null
          videoid2?: string | null
          vocabulary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_details_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_details_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic_with_parent"
            referencedColumns: ["id"]
          },
        ]
      }
      image: {
        Row: {
          contentid: string | null
          Default: string | null
          description: string | null
          id: string
          imagefile: string | null
          imagelink: string | null
          name: string | null
          questionid: string | null
          showimage: string | null
          topicid: number | null
        }
        Insert: {
          contentid?: string | null
          Default?: string | null
          description?: string | null
          id: string
          imagefile?: string | null
          imagelink?: string | null
          name?: string | null
          questionid?: string | null
          showimage?: string | null
          topicid?: number | null
        }
        Update: {
          contentid?: string | null
          Default?: string | null
          description?: string | null
          id?: string
          imagefile?: string | null
          imagelink?: string | null
          name?: string | null
          questionid?: string | null
          showimage?: string | null
          topicid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "image_contentid_fkey"
            columns: ["contentid"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic_with_parent"
            referencedColumns: ["id"]
          },
        ]
      }
      question: {
        Row: {
          answer: string | null
          cau_tra_loi_1: string | null
          cau_tra_loi_2: string | null
          cau_tra_loi_3: string | null
          cau_tra_loi_4: string | null
          contentid: string | null
          correct_choice: string | null
          duration: string | null
          explanation: string | null
          id: string
          noi_dung: string | null
          picture: string | null
          question_type: string | null
          questionlevel: string | null
          questionorder: number | null
          randomorder: number | null
          tg_tao: string | null
          topicid: number | null
          translation: string | null
          update: string | null
          video: string | null
          writing_choice: string | null
        }
        Insert: {
          answer?: string | null
          cau_tra_loi_1?: string | null
          cau_tra_loi_2?: string | null
          cau_tra_loi_3?: string | null
          cau_tra_loi_4?: string | null
          contentid?: string | null
          correct_choice?: string | null
          duration?: string | null
          explanation?: string | null
          id: string
          noi_dung?: string | null
          picture?: string | null
          question_type?: string | null
          questionlevel?: string | null
          questionorder?: number | null
          randomorder?: number | null
          tg_tao?: string | null
          topicid?: number | null
          translation?: string | null
          update?: string | null
          video?: string | null
          writing_choice?: string | null
        }
        Update: {
          answer?: string | null
          cau_tra_loi_1?: string | null
          cau_tra_loi_2?: string | null
          cau_tra_loi_3?: string | null
          cau_tra_loi_4?: string | null
          contentid?: string | null
          correct_choice?: string | null
          duration?: string | null
          explanation?: string | null
          id?: string
          noi_dung?: string | null
          picture?: string | null
          question_type?: string | null
          questionlevel?: string | null
          questionorder?: number | null
          randomorder?: number | null
          tg_tao?: string | null
          topicid?: number | null
          translation?: string | null
          update?: string | null
          video?: string | null
          writing_choice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_contentid_fkey"
            columns: ["contentid"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic_with_parent"
            referencedColumns: ["id"]
          },
        ]
      }
      student_try: {
        Row: {
          answer_choice: string | null
          assignment_student_try_id: string | null
          correct_answer: string | null
          currentindex: number | null
          hocsinh_id: string | null
          id: string
          question_id: string | null
          quiz_result: string | null
          score: number | null
          showcontent: boolean | null
          time_end: string | null
          time_start: string | null
          update: string | null
          writing_answer: string | null
        }
        Insert: {
          answer_choice?: string | null
          assignment_student_try_id?: string | null
          correct_answer?: string | null
          currentindex?: number | null
          hocsinh_id?: string | null
          id: string
          question_id?: string | null
          quiz_result?: string | null
          score?: number | null
          showcontent?: boolean | null
          time_end?: string | null
          time_start?: string | null
          update?: string | null
          writing_answer?: string | null
        }
        Update: {
          answer_choice?: string | null
          assignment_student_try_id?: string | null
          correct_answer?: string | null
          currentindex?: number | null
          hocsinh_id?: string | null
          id?: string
          question_id?: string | null
          quiz_result?: string | null
          score?: number | null
          showcontent?: boolean | null
          time_end?: string | null
          time_start?: string | null
          update?: string | null
          writing_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_try_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question"
            referencedColumns: ["id"]
          },
        ]
      }
      student_try_content: {
        Row: {
          contentid: string | null
          id: string
          student_id: string | null
          update: string | null
        }
        Insert: {
          contentid?: string | null
          id: string
          student_id?: string | null
          update?: string | null
        }
        Update: {
          contentid?: string | null
          id?: string
          student_id?: string | null
          update?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_try_content_contentid_fkey"
            columns: ["contentid"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_try_content_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topic: {
        Row: {
          challengesubject: string | null
          id: number
          image: string | null
          mon: string | null
          noi_dung: string | null
          Order: number | null
          parentid: string | null
          short_summary: string | null
          showstudent: boolean | null
          topic: string
        }
        Insert: {
          challengesubject?: string | null
          id: number
          image?: string | null
          mon?: string | null
          noi_dung?: string | null
          Order?: number | null
          parentid?: string | null
          short_summary?: string | null
          showstudent?: boolean | null
          topic: string
        }
        Update: {
          challengesubject?: string | null
          id?: number
          image?: string | null
          mon?: string | null
          noi_dung?: string | null
          Order?: number | null
          parentid?: string | null
          short_summary?: string | null
          showstudent?: boolean | null
          topic?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          birthday: string | null
          category: string | null
          creationdate: string | null
          creationuser: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          merakiemail: string | null
          note: string | null
          parentemail: string | null
          parentname: string | null
          parentphone: string | null
          phone: string | null
          Show: string | null
          Update: string | null
        }
        Insert: {
          birthday?: string | null
          category?: string | null
          creationdate?: string | null
          creationuser?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          merakiemail?: string | null
          note?: string | null
          parentemail?: string | null
          parentname?: string | null
          parentphone?: string | null
          phone?: string | null
          Show?: string | null
          Update?: string | null
        }
        Update: {
          birthday?: string | null
          category?: string | null
          creationdate?: string | null
          creationuser?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          merakiemail?: string | null
          note?: string | null
          parentemail?: string | null
          parentname?: string | null
          parentphone?: string | null
          phone?: string | null
          Show?: string | null
          Update?: string | null
        }
        Relationships: []
      }
      video: {
        Row: {
          contentid: string | null
          description: string | null
          first: string | null
          id: string
          second: string | null
          ShowVideo: string | null
          topicid: number | null
          video_name: string | null
          videolink: string | null
          videoupload: string | null
        }
        Insert: {
          contentid?: string | null
          description?: string | null
          first?: string | null
          id: string
          second?: string | null
          ShowVideo?: string | null
          topicid?: number | null
          video_name?: string | null
          videolink?: string | null
          videoupload?: string | null
        }
        Update: {
          contentid?: string | null
          description?: string | null
          first?: string | null
          id?: string
          second?: string | null
          ShowVideo?: string | null
          topicid?: number | null
          video_name?: string | null
          videolink?: string | null
          videoupload?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_topicid_fkey"
            columns: ["topicid"]
            isOneToOne: false
            referencedRelation: "topic_with_parent"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      topic_with_parent: {
        Row: {
          id: number | null
          parent_topic_name: string | null
          subtopic_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
