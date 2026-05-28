-- 迁移: 评级改为 SS/S/A/B/C/D/E/F 体系 + 新增冠军次数字段
-- 执行: docker exec -i malahot-mysql mysql -u root -p'Malahot2025!' --default-character-set=utf8mb4

-- ===== 正式环境 =====
USE malahot;

ALTER TABLE `user` ADD COLUMN `champion_count` INT NOT NULL DEFAULT 0 COMMENT '冠军次数' AFTER `rating`;

UPDATE `user` SET `rating` = CASE
    WHEN `rating` = 'SSR' THEN 'SS'
    WHEN `rating` = 'SR' THEN 'S'
    WHEN `rating` = 'S' THEN 'A'
    WHEN `rating` = 'A' THEN 'B'
    WHEN `rating` = 'B' THEN 'C'
    WHEN `rating` = 'C' THEN 'D'
    WHEN `rating` = 'D' THEN 'E'
    WHEN `rating` = 'E' THEN 'F'
    ELSE `rating`
END;

ALTER TABLE `user` MODIFY COLUMN `rating` VARCHAR(10) NOT NULL DEFAULT 'D' COMMENT '战力评级: SS/S/A/B/C/D/E/F';

-- ===== 测试环境 =====
USE malahot_test;

ALTER TABLE `user` ADD COLUMN `champion_count` INT NOT NULL DEFAULT 0 COMMENT '冠军次数' AFTER `rating`;

UPDATE `user` SET `rating` = CASE
    WHEN `rating` = 'SSR' THEN 'SS'
    WHEN `rating` = 'SR' THEN 'S'
    WHEN `rating` = 'S' THEN 'A'
    WHEN `rating` = 'A' THEN 'B'
    WHEN `rating` = 'B' THEN 'C'
    WHEN `rating` = 'C' THEN 'D'
    WHEN `rating` = 'D' THEN 'E'
    WHEN `rating` = 'E' THEN 'F'
    ELSE `rating`
END;

ALTER TABLE `user` MODIFY COLUMN `rating` VARCHAR(10) NOT NULL DEFAULT 'D' COMMENT '战力评级: SS/S/A/B/C/D/E/F';
