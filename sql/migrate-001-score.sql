-- Malahot 数据库升级脚本 - 添加个人积分系统
-- 在服务器上执行: docker exec -i malahot-mysql mysql -u root -p"密码" malahot < sql/migrate-001-score.sql

USE malahot;

-- 用户表添加积分字段
ALTER TABLE `user`
    ADD COLUMN `score` INT NOT NULL DEFAULT 0 COMMENT '个人积分' AFTER `status`,
    ADD COLUMN `matches_played` INT NOT NULL DEFAULT 0 COMMENT '总场次' AFTER `score`,
    ADD COLUMN `wins` INT NOT NULL DEFAULT 0 COMMENT '总胜场' AFTER `matches_played`,
    ADD COLUMN `rating` VARCHAR(10) NOT NULL DEFAULT 'C' COMMENT '评级: SSR/SR/S/A/B/C/D/E' AFTER `wins`,
    ADD KEY `idx_score` (`score` DESC);

-- 冠军历史表
CREATE TABLE IF NOT EXISTS `champion_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `competition_id` BIGINT NOT NULL COMMENT '赛事ID',
    `season_name` VARCHAR(50) NOT NULL COMMENT '赛季名称',
    `team_name` VARCHAR(50) NOT NULL COMMENT '冠军队伍名称',
    `captain_name` VARCHAR(50) DEFAULT NULL COMMENT '队长昵称',
    `members` TEXT COMMENT '队员名单(逗号分隔)',
    `crowned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '夺冠时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_competition` (`competition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='冠军历史表';

-- 对 malahot_test 也执行同样操作（如果存在）
-- 忽略错误，测试库可能不存在
CREATE DATABASE IF NOT EXISTS `malahot_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE malahot_test;

ALTER TABLE `user`
    ADD COLUMN `score` INT NOT NULL DEFAULT 0 COMMENT '个人积分' AFTER `status`,
    ADD COLUMN `matches_played` INT NOT NULL DEFAULT 0 COMMENT '总场次' AFTER `score`,
    ADD COLUMN `wins` INT NOT NULL DEFAULT 0 COMMENT '总胜场' AFTER `matches_played`,
    ADD COLUMN `rating` VARCHAR(10) NOT NULL DEFAULT 'C' COMMENT '评级' AFTER `wins`,
    ADD KEY `idx_score` (`score` DESC);

CREATE TABLE IF NOT EXISTS `champion_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `competition_id` BIGINT NOT NULL COMMENT '赛事ID',
    `season_name` VARCHAR(50) NOT NULL COMMENT '赛季名称',
    `team_name` VARCHAR(50) NOT NULL COMMENT '冠军队伍名称',
    `captain_name` VARCHAR(50) DEFAULT NULL COMMENT '队长昵称',
    `members` TEXT COMMENT '队员名单(逗号分隔)',
    `crowned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '夺冠时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_competition` (`competition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='冠军历史表';
