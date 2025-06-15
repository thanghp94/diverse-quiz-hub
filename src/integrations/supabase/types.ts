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
      assignment: {
        Row: {
          Assignmentname: string | null
          category: string | null
          contentid: string | null
          created_at: string
          description: string | null
          expiring_date: string | null
          id: string
          imagelink: string | null
          noofquestion: number | null
          Question_id: string | null
          status: string | null
          subject: string | null
          testtype: string | null
          tg_tao: string | null
          topicid: string | null
          type: string | null
          typeofquestion: string | null
          update: string | null
        }
        Insert: {
          Assignmentname?: string | null
          category?: string | null
          contentid?: string | null
          created_at?: string
          description?: string | null
          expiring_date?: string | null
          id: string
          imagelink?: string | null
          noofquestion?: number | null
          Question_id?: string | null
          status?: string | null
          subject?: string | null
          testtype?: string | null
          tg_tao?: string | null
          topicid?: string | null
          type?: string | null
          typeofquestion?: string | null
          update?: string | null
        }
        Update: {
          Assignmentname?: string | null
          category?: string | null
          contentid?: string | null
          created_at?: string
          description?: string | null
          expiring_date?: string | null
          id?: string
          imagelink?: string | null
          noofquestion?: number | null
          Question_id?: string | null
          status?: string | null
          subject?: string | null
          testtype?: string | null
          tg_tao?: string | null
          topicid?: string | null
          type?: string | null
          typeofquestion?: string | null
          update?: string | null
        }
        Relationships: []
      }
      assignment_student_try: {
        Row: {
          assignmentid: string | null
          contentID: string | null
          end_time: string | null
          hocsinh_id: string | null
          id: number
          questionIDs: string | null
          start_time: string | null
          typeoftaking: string | null
          update: string | null
        }
        Insert: {
          assignmentid?: string | null
          contentID?: string | null
          end_time?: string | null
          hocsinh_id?: string | null
          id?: number
          questionIDs?: string | null
          start_time?: string | null
          typeoftaking?: string | null
          update?: string | null
        }
        Update: {
          assignmentid?: string | null
          contentID?: string | null
          end_time?: string | null
          hocsinh_id?: string | null
          id?: number
          questionIDs?: string | null
          start_time?: string | null
          typeoftaking?: string | null
          update?: string | null
        }
        Relationships: []
      }
      content: {
        Row: {
          challengesubject: string[] | null
          classdone: string | null
          contentgroup: string | null
          dk_loc: string | null
          dk_loc_2: string | null
          hanh_dong: string | null
          header: string | null
          id: string
          imageid: string | null
          imagelink: string | null
          information: string | null
          mindmap: string | null
          mindmapurl: string | null
          order: string | null
          parentid: string | null
          prompt: string | null
          second_short_blurb: string | null
          short_blurb: string | null
          short_description: string | null
          show: string | null
          showstudent: string | null
          showtranslation: string | null
          studentseen: string | null
          title: string
          topicid: string | null
          translation: string | null
          typeoftaking: string | null
          update: string | null
          url: string | null
          videoid: string | null
          videoid2: string | null
          vocabulary: string | null
        }
        Insert: {
          challengesubject?: string[] | null
          classdone?: string | null
          contentgroup?: string | null
          dk_loc?: string | null
          dk_loc_2?: string | null
          hanh_dong?: string | null
          header?: string | null
          id: string
          imageid?: string | null
          imagelink?: string | null
          information?: string | null
          mindmap?: string | null
          mindmapurl?: string | null
          order?: string | null
          parentid?: string | null
          prompt?: string | null
          second_short_blurb?: string | null
          short_blurb?: string | null
          short_description?: string | null
          show?: string | null
          showstudent?: string | null
          showtranslation?: string | null
          studentseen?: string | null
          title: string
          topicid?: string | null
          translation?: string | null
          typeoftaking?: string | null
          update?: string | null
          url?: string | null
          videoid?: string | null
          videoid2?: string | null
          vocabulary?: string | null
        }
        Update: {
          challengesubject?: string[] | null
          classdone?: string | null
          contentgroup?: string | null
          dk_loc?: string | null
          dk_loc_2?: string | null
          hanh_dong?: string | null
          header?: string | null
          id?: string
          imageid?: string | null
          imagelink?: string | null
          information?: string | null
          mindmap?: string | null
          mindmapurl?: string | null
          order?: string | null
          parentid?: string | null
          prompt?: string | null
          second_short_blurb?: string | null
          short_blurb?: string | null
          short_description?: string | null
          show?: string | null
          showstudent?: string | null
          showtranslation?: string | null
          studentseen?: string | null
          title?: string
          topicid?: string | null
          translation?: string | null
          typeoftaking?: string | null
          update?: string | null
          url?: string | null
          videoid?: string | null
          videoid2?: string | null
          vocabulary?: string | null
        }
        Relationships: []
      }
      image: {
        Row: {
          contentid: string | null
          default: string | null
          description: string | null
          id: string
          imagefile: string | null
          imagelink: string | null
          name: string | null
          questionid: string | null
          showimage: string | null
          topicid: string | null
        }
        Insert: {
          contentid?: string | null
          default?: string | null
          description?: string | null
          id: string
          imagefile?: string | null
          imagelink?: string | null
          name?: string | null
          questionid?: string | null
          showimage?: string | null
          topicid?: string | null
        }
        Update: {
          contentid?: string | null
          default?: string | null
          description?: string | null
          id?: string
          imagefile?: string | null
          imagelink?: string | null
          name?: string | null
          questionid?: string | null
          showimage?: string | null
          topicid?: string | null
        }
        Relationships: []
      }
      matching: {
        Row: {
          choice1: string | null
          choice2: string | null
          choice3: string | null
          choice4: string | null
          choice5: string | null
          choice6: string | null
          created_at: string
          description: string | null
          id: string
          prompt1: string | null
          prompt2: string | null
          prompt3: string | null
          prompt4: string | null
          prompt5: string | null
          prompt6: string | null
          subject: string | null
          topic: string | null
          type: string | null
        }
        Insert: {
          choice1?: string | null
          choice2?: string | null
          choice3?: string | null
          choice4?: string | null
          choice5?: string | null
          choice6?: string | null
          created_at?: string
          description?: string | null
          id: string
          prompt1?: string | null
          prompt2?: string | null
          prompt3?: string | null
          prompt4?: string | null
          prompt5?: string | null
          prompt6?: string | null
          subject?: string | null
          topic?: string | null
          type?: string | null
        }
        Update: {
          choice1?: string | null
          choice2?: string | null
          choice3?: string | null
          choice4?: string | null
          choice5?: string | null
          choice6?: string | null
          created_at?: string
          description?: string | null
          id?: string
          prompt1?: string | null
          prompt2?: string | null
          prompt3?: string | null
          prompt4?: string | null
          prompt5?: string | null
          prompt6?: string | null
          subject?: string | null
          topic?: string | null
          type?: string | null
        }
        Relationships: []
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
          questionorder: string | null
          randomorder: string | null
          tg_tao: string | null
          time: string | null
          topicid: string | null
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
          questionorder?: string | null
          randomorder?: string | null
          tg_tao?: string | null
          time?: string | null
          topicid?: string | null
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
          questionorder?: string | null
          randomorder?: string | null
          tg_tao?: string | null
          time?: string | null
          topicid?: string | null
          translation?: string | null
          update?: string | null
          video?: string | null
          writing_choice?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      topic: {
        Row: {
          challengesubject: string | null
          id: string
          image: string | null
          mon: string | null
          noi_dung: string | null
          order: number | null
          parentid: string | null
          short_summary: string | null
          showstudent: boolean | null
          topic: string
        }
        Insert: {
          challengesubject?: string | null
          id: string
          image?: string | null
          mon?: string | null
          noi_dung?: string | null
          order?: number | null
          parentid?: string | null
          short_summary?: string | null
          showstudent?: boolean | null
          topic: string
        }
        Update: {
          challengesubject?: string | null
          id?: string
          image?: string | null
          mon?: string | null
          noi_dung?: string | null
          order?: number | null
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
