const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CoachLinkSkill",
  tableName: "COACH_LINK_SKILL",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    coach_id: {
      type: "uuid",
      nullable: false,
    },
    skill_id: {
      type: "uuid",
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
  },
  // 增加唯一約束，防止同一個教練重複綁定同一個技能
  uniques: [
    {
      name: "coach_link_skill_unique",
      columns: ["coach_id", "skill_id"],
    },
  ],
  // 定義關聯處
  relations: {
    Coach: {
      target: "Coach",
      type: "many-to-one", // 一個教練可以擁有多個技能關連
      inverseSide: "CoachLinkSkill",
      joinColumn: {
        name: "coach_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "coach_link_skill_coach_id_fk",
      },
      cascade: false,
    },
    Skill: {
      target: "Skill",
      type: "many-to-one", // 一個技能可以被多個教練擁有
      joinColumn: {
        name: "skill_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "coach_link_skill_skill_id_fk",
      },
      cascade: false,
    },
  },
});
