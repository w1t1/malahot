package com.malahot.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.malahot.dto.request.CompetitionRequest;
import com.malahot.entity.Competition;

public interface CompetitionService {

    Competition create(CompetitionRequest request, Long userId);

    Competition update(Long id, CompetitionRequest request, Long userId);

    void updateStatus(Long id, String status, Long userId);

    Competition getById(Long id);

    IPage<Competition> list(int page, int size, String status, String gameType);
}
