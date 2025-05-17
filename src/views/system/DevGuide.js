import React, { useState } from 'react';
import { CCard, CCardBody, CCol, CForm, CFormInput, CRow, CButton, CFormTextarea } from '@coreui/react';
import axiosInstance from 'src/api/axiosInstance';

const DevGuide = () => {
  const [filter, setFilter] = useState({ tableName: '', path: 'architecture' });
  const [generatedXml, setGeneratedXml] = useState('');

  const paths = [
    { id: 'architecture', name: '아키텍처' },
    { id: 'system', name: '시스템' },
    { id: 'other', name: '기타' },
  ];

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const fetchColumns = async () => {
    try {
      const res = await axiosInstance.get('/api/system/dev-guide/columns', {
        params: { tableName: filter.tableName },
      });
      const columns = res.data;
      generateCrudSql(columns);
    } catch (err) {
      console.error('컬럼 조회 실패', err);
    }
  };

  const generateCrudSql = (columns) => {
    if (!columns || columns.length === 0) return;

    let tableName = filter.tableName.toUpperCase();

    // 카멜 표기법으로 변환하는 부분
    const camelCaseTableName = tableName
      .replace(/^tb_/, '')  // 'tb_' 제거
      .split('_')
      .map((word, index) => {
        return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    // 첫 번째 글자를 대문자로 변경한 카멜 표기법
    const camelCaseTableNameUpper = camelCaseTableName.charAt(0).toUpperCase() + camelCaseTableName.slice(1);

    // 'tb_'를 제거하고 카멜 표기법으로만 변경한 테이블명
    const camelCaseTableNameWithoutTb = tableName
      .replace(/^tb_/, '')
      .split('_')
      .map((word, index) => {
        return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    // 'tb_'를 제거하고 카멜 표기법으로만 변경한 테이블명에서 첫 번째 글자를 대문자로 변경
    const camelCaseTableNameWithoutTbUpper = camelCaseTableNameWithoutTb.charAt(0).toUpperCase() + camelCaseTableNameWithoutTb.slice(1);

    const modelPath = filter.path;

    // mapperNamespace에서 'tb_'만 제거하고, 카멜 표기법을 그대로 유지
    const mapperNamespace = `com.smart.rms.${modelPath}.mapper.${camelCaseTableNameWithoutTb}Mapper`;

    // modelClass에 카멜 표기법 테이블명을 적용한 모델 클래스명
    const modelClass = `com.smart.rms.${modelPath}.model.${camelCaseTableNameUpper}`;

    // 컬럼 이름을 카멜 표기법으로 변환 (컬럼명: 데이터타입 맵핑)
    const camelCaseColumns = columns.map(col => {
      return col.column_name.split('_').map((word, idx) => {
        return idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join('');
    });

    // SQL 쿼리 생성 함수
    // SQL 쿼리 생성 함수
    const createSql = (type) => {
      const commonFields = columns.map(col => `${col.column_name.toUpperCase()}`).join(',\n    ');

      if (type === 'select') {
        return `
<!-- 전체 조회 -->
<select id="findAll" resultType="${modelClass}">
    SELECT
    ${commonFields}
    FROM ${tableName}
    WHERE 1=1
    AND DEL_YN = 'N'
    ORDER BY ${columns[0].column_name.toUpperCase()} ASC
</select>`;
      }

      if (type === 'insert') {
        const valueFields = camelCaseColumns.map(col => `#{${col}}`).join(',\n    ');
        return `
<!-- 등록 -->
<insert id="insert" parameterType="${modelClass}">
    <selectKey keyProperty="userId" resultType="long" order="BEFORE">
        SELECT nextval('${tableName.toLowerCase()}_seq')
    </selectKey>
    INSERT INTO ${tableName} (
    ${commonFields}
    )
    VALUES (
    ${valueFields}
    )
</insert>`;
      }

      if (type === 'update') {
        const updateFields = columns.map((col, idx) => `
    <if test="${camelCaseColumns[idx]} != null">
        , ${col.column_name.toUpperCase()} = #{${camelCaseColumns[idx]}}
    </if>`).join('');
        return `
<!-- 수정 -->
<update id="update" parameterType="${modelClass}">
    UPDATE ${tableName}
    SET MOD_DT = CURRENT_TIMESTAMP
    ${updateFields}
    WHERE ${columns[0].column_name.toUpperCase()} = #{${camelCaseColumns[0]}}
</update>`;
      }

      if (type === 'delete') {
        return `
<!-- 삭제 -->
<update id="deleteById">
    UPDATE ${tableName}
    SET DEL_YN = 'Y', MOD_ID = 'system', MOD_DT = CURRENT_TIMESTAMP
    WHERE ${columns[0].column_name.toUpperCase()} = #{${camelCaseColumns[0]}}
</update>`;
      }
    };

    // 모든 SQL 쿼리 생성
    const mapperXml = `
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="${mapperNamespace}">
    ${createSql('select')}
    ${createSql('insert')}
    ${createSql('update')}
    ${createSql('delete')}
</mapper>
`;

    setGeneratedXml(`
1. model
${generateModelCode(columns, modelClass)}
2. controller
${generateControllerCode(modelClass, camelCaseTableNameWithoutTb, camelCaseTableNameWithoutTbUpper)}
3. service
${generateServiceCode(modelClass, camelCaseTableNameWithoutTb, camelCaseTableNameWithoutTbUpper)}
4. mapper
${generateMapperCode(modelClass, camelCaseTableNameWithoutTb)}
5. mapper.xml
${mapperXml}
`);
  };

  const generateModelCode = (columns, modelClass) => {
    return `
package com.smart.rms.${filter.path}.model;

import lombok.Data;
import java.util.Date;

@Data
public class ${modelClass} {
  ${columns.map(col => {
      const columnName = col.column_name;
      let fieldType = 'String';
      if (col.data_type === 'bigint') {
        fieldType = 'Long';
      } else if (col.data_type === 'timestamp without time zone') {
        fieldType = 'Date';
      }
      const camelCaseCol = columnName.split('_').map((word, idx) => idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
      return `private ${fieldType} ${camelCaseCol};`;
    }).join('\n  ')}
}
`;
  };

  const generateControllerCode = (modelClass, camelCaseTableNameWithoutTb, camelCaseTableNameWithoutTbUpper) => {
    return `
package com.smart.rms.${filter.path}.controller;

import com.smart.rms.${filter.path}.model.${modelClass};
import com.smart.rms.${filter.path}.service.${camelCaseTableNameWithoutTbUpper}Service;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/${camelCaseTableNameWithoutTb}")
@RequiredArgsConstructor
public class ${camelCaseTableNameWithoutTbUpper}Controller {

    private final ${camelCaseTableNameWithoutTbUpper}Service ${camelCaseTableNameWithoutTb}Service;

    @GetMapping("/")
    public List<${modelClass}> findAll() {
        return ${camelCaseTableNameWithoutTb}Service.findAll();
    }

    @GetMapping("/{id}")
    public ${modelClass} findById(@PathVariable Long id) {
        return ${camelCaseTableNameWithoutTb}Service.findById(id);
    }

    @PostMapping("/")
    public ${modelClass} save(@RequestBody ${modelClass} ${camelCaseTableNameWithoutTb}) {
        return ${camelCaseTableNameWithoutTb}Service.save(${camelCaseTableNameWithoutTb});
    }

    @PutMapping("/{id}")
    public ${modelClass} update(@PathVariable Long id, @RequestBody ${modelClass} ${camelCaseTableNameWithoutTb}) {
        return ${camelCaseTableNameWithoutTb}Service.update(id, ${camelCaseTableNameWithoutTb});
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ${camelCaseTableNameWithoutTb}Service.delete(id);
    }
}
`;
  };

  const generateServiceCode = (modelClass, camelCaseTableNameWithoutTb, camelCaseTableNameWithoutTbUpper) => {
    return `
package com.smart.rms.${filter.path}.service;

import com.smart.rms.${filter.path}.model.${modelClass};
import com.smart.rms.${filter.path}.mapper.${camelCaseTableNameWithoutTb}Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ${camelCaseTableNameWithoutTbUpper}Service {

    private final ${camelCaseTableNameWithoutTb}Mapper ${camelCaseTableNameWithoutTb}Mapper;

    public List<${modelClass}> findAll() {
        return ${camelCaseTableNameWithoutTb}Mapper.findAll();
    }

    public ${modelClass} findById(Long id) {
        return ${camelCaseTableNameWithoutTb}Mapper.findById(id).orElse(null);
    }

    public ${modelClass} save(${modelClass} ${camelCaseTableNameWithoutTb}) {
        return ${camelCaseTableNameWithoutTb}Mapper.save(${camelCaseTableNameWithoutTb});
    }

    public ${modelClass} update(Long id, ${modelClass} ${camelCaseTableNameWithoutTb}) {
        ${camelCaseTableNameWithoutTb}.setId(id);
        return ${camelCaseTableNameWithoutTb}Mapper.save(${camelCaseTableNameWithoutTb});
    }

    public void delete(Long id) {
        ${camelCaseTableNameWithoutTb}Mapper.deleteById(id);
    }
}
`;
  };

  const generateMapperCode = (modelClass, camelCaseTableNameWithoutTb) => {
    return `
package com.smart.rms.${filter.path}.mapper;

import com.smart.rms.${filter.path}.model.${modelClass};
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ${camelCaseTableNameWithoutTb}Mapper {

    List<${modelClass}> findByKeyword(${modelClass} ${camelCaseTableNameWithoutTb});
    ${modelClass} findById(@Param("id") Long id);
    int insert(${modelClass} ${camelCaseTableNameWithoutTb});
    int update(${modelClass} ${camelCaseTableNameWithoutTb});
    int deleteById(@Param("id") Long id);
    int updateOrderOne(${modelClass} ${camelCaseTableNameWithoutTb});
    List<${modelClass}> findAllActive();
}
`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchColumns();
  };

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={handleSearch}>
            <CRow className="mb-2">
              <CCol md={4}>
                <CFormInput
                  label="테이블명"
                  name="tableName"
                  value={filter.tableName}
                  onChange={handleChangeFilter}
                  placeholder="테이블명을 입력하세요"
                />
              </CCol>
              <CCol md={4}>
                <label>경로 선택</label>
                <select
                  name="path"
                  value={filter.path}
                  onChange={handleChangeFilter}
                  className="form-select"
                >
                  {paths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.name}
                    </option>
                  ))}
                </select>
              </CCol>
            </CRow>
            <div className="d-flex justify-content-end">
              <CButton type="submit" color="primary">
                조회
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody>
          <CFormTextarea
            rows="20"
            style={{
              resize: 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              backgroundColor: '#2e2e2e',
              color: 'white',
              height: 'auto',
            }}
            value={generatedXml}
            onChange={(e) => setGeneratedXml(e.target.value)}  // onChange 핸들러 추가

          />
        </CCardBody>
      </CCard>
    </>
  );
};

export default DevGuide;
