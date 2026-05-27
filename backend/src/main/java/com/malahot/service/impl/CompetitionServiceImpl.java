package com.malahot.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.malahot.dto.request.CompetitionRequest;
import com.malahot.entity.Competition;
import com.malahot.enums.CompetitionFormat;
import com.malahot.enums.CompetitionStatus;
import com.malahot.mapper.CompetitionMapper;
import com.malahot.service.CompetitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CompetitionServiceImpl implements CompetitionService {

    private final CompetitionMapper competitionMapper;

    @Override
    public Competition create(CompetitionRequest request, Long userId) {
        if (request.getRegistrationEnd().isBefore(request.getRegistrationStart())) {
            throw new RuntimeException("报名截止时间不能早于开始时间");
        }

        Competition competition = new Competition();
        copyProperties(request, competition);
        competition.setStatus(CompetitionStatus.DRAFT.name());
        competition.setCreatedBy(userId);

        if (!StringUtils.hasText(competition.getFormat())) {
            competition.setFormat(CompetitionFormat.SINGLE_ELIMINATION.name());
        }

        competitionMapper.insert(competition);
        return competition;
    }

    @Override
    public Competition update(Long id, CompetitionRequest request, Long userId) {
        Competition competition = getAndValidateOwner(id, userId);

        if (!CompetitionStatus.DRAFT.name().equals(competition.getStatus())) {
            throw new RuntimeException("只能编辑草稿状态的赛事");
        }

        copyProperties(request, competition);
        competitionMapper.updateById(competition);
        return competition;
    }

    @Override
    public void updateStatus(Long id, String status, Long userId) {
        Competition competition = getAndValidateOwner(id, userId);
        String currentStatus = competition.getStatus();

        // Validate status transition
        switch (CompetitionStatus.valueOf(status)) {
            case REGISTRATION -> {
                if (!CompetitionStatus.DRAFT.name().equals(currentStatus)) {
                    throw new RuntimeException("只能从草稿状态发布赛事");
                }
            }
            case IN_PROGRESS -> {
                if (!CompetitionStatus.REGISTRATION.name().equals(currentStatus)) {
                    throw new RuntimeException("只能从报名中状态开始比赛");
                }
            }
            case FINISHED -> {
                if (!CompetitionStatus.IN_PROGRESS.name().equals(currentStatus)) {
                    throw new RuntimeException("只能从进行中状态结束比赛");
                }
            }
            case CANCELLED -> {
                if (CompetitionStatus.FINISHED.name().equals(currentStatus)) {
                    throw new RuntimeException("已结束的赛事不能取消");
                }
            }
            default -> throw new RuntimeException("不支持的状态: " + status);
        }

        competition.setStatus(status);
        competitionMapper.updateById(competition);
    }

    @Override
    public Competition getById(Long id) {
        Competition competition = competitionMapper.selectById(id);
        if (competition == null) {
            throw new RuntimeException("赛事不存在");
        }
        return competition;
    }

    @Override
    public IPage<Competition> list(int page, int size, String status, String gameType) {
        LambdaQueryWrapper<Competition> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(Competition::getStatus, status);
        }
        if (StringUtils.hasText(gameType)) {
            wrapper.eq(Competition::getGameType, gameType);
        }
        wrapper.orderByDesc(Competition::getCreatedAt);
        return competitionMapper.selectPage(new Page<>(page, size), wrapper);
    }

    private Competition getAndValidateOwner(Long id, Long userId) {
        Competition competition = getById(id);
        if (!competition.getCreatedBy().equals(userId)) {
            throw new RuntimeException("无权操作此赛事");
        }
        return competition;
    }

    private void copyProperties(CompetitionRequest request, Competition competition) {
        competition.setTitle(request.getTitle());
        competition.setGameType(request.getGameType());
        competition.setDescription(request.getDescription());
        competition.setRules(request.getRules());
        competition.setCoverImage(request.getCoverImage());
        competition.setMaxTeams(request.getMaxTeams());
        competition.setTeamSize(request.getTeamSize());
        competition.setFormat(request.getFormat());
        competition.setRegistrationStart(request.getRegistrationStart());
        competition.setRegistrationEnd(request.getRegistrationEnd());
        competition.setCompetitionStart(request.getCompetitionStart());
    }
}
