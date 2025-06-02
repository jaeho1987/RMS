import React, { useState } from 'react';
import { CCard, CCardBody, CCol, CForm, CFormInput, CRow, CButton, CFormTextarea } from '@coreui/react';
import axiosInstance from 'src/api/axiosInstance';

const DevGuide = () => {
  const [filter, setFilter] = useState({ tableName: '', path: 'architecture' });
  const [generatedSource, setgeneratedSource] = useState('');
  const [camelCaseTableName, setCamelCaseTableName] = useState('');
  const [camelCaseTableNameUpper, setCamelCaseTableNameUpper] = useState('');
  const [camelCaseTableNameWithoutTb, setCamelCaseTableNameWithoutTb] = useState('');
  const [camelCaseTableNameWithoutTbUpper, setCamelCaseTableNameWithoutTbUpper] = useState('');

  const paths = [
    { id: 'architecture', name: '아키텍처' },
    { id: 'system', name: '시스템' },
    { id: 'other', name: '기타' },
  ];

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => {
      const updatedFilter = { ...prev, [name]: value };
      if (name === 'tableName') {
        updateTableNameState(updatedFilter.tableName);  // 테이블명이 변경될 때마다 상태 업데이트
      }
      return updatedFilter;
    });
  };

  const updateTableNameState = (tableName) => {
    const upperTableName = tableName.toUpperCase();
    // 카멜 표기법으로 변환하는 부분
    const camelCaseTableName = upperTableName
      .split('_')
      .map((word, index) => {
        return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    // 첫 번째 글자를 대문자로 변경한 카멜 표기법
    const camelCaseTableNameUpper = camelCaseTableName.charAt(0).toUpperCase() + camelCaseTableName.slice(1);

    // 'tb_'를 제거하고 카멜 표기법으로만 변경한 테이블명
    const camelCaseTableNameWithoutTb = tableName
      .replace(/^TB_/, '')
      .replace(/^tb_/, '')
      .split('_')
      .map((word, index) => {
        return index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    // 'tb_'를 제거하고 카멜 표기법으로만 변경한 테이블명에서 첫 번째 글자를 대문자로 변경
    const camelCaseTableNameWithoutTbUpper = camelCaseTableNameWithoutTb.charAt(0).toUpperCase() + camelCaseTableNameWithoutTb.slice(1);

    // 상태 업데이트
    setCamelCaseTableName(camelCaseTableName);
    setCamelCaseTableNameUpper(camelCaseTableNameUpper);
    setCamelCaseTableNameWithoutTb(camelCaseTableNameWithoutTb);
    setCamelCaseTableNameWithoutTbUpper(camelCaseTableNameWithoutTbUpper);
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

  const generateControllerCode = (camelCaseColumns) => {
    return `
package com.smart.rms.${filter.path}.controller;

import com.smart.rms.${filter.path}.model.${camelCaseTableNameUpper};
import com.smart.rms.${filter.path}.service.${camelCaseTableNameWithoutTbUpper}Service;
import com.smart.rms.util.ApiUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/${camelCaseTableNameWithoutTb}")
@RequiredArgsConstructor
public class ${camelCaseTableNameWithoutTbUpper}Controller {

    private final ${camelCaseTableNameWithoutTbUpper}Service ${camelCaseTableNameWithoutTb}Service;

    @GetMapping
    public List<${camelCaseTableNameUpper}> findByKeyword(@ModelAttribute ${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb}) {
        return ${camelCaseTableNameWithoutTb}Service.findByKeyword(${camelCaseTableNameWithoutTb});
    }

    @GetMapping("/{id}")
    public ${camelCaseTableNameUpper} findById(@PathVariable Long id) {
        return ${camelCaseTableNameWithoutTb}Service.findById(id);
    }

    @PostMapping
    public ResponseEntity<?> insert(@RequestBody ${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb}) {
        ${camelCaseTableNameWithoutTb}.setDelYn("N");
        return ApiUtil.success(${camelCaseTableNameWithoutTb}Service.insert(${camelCaseTableNameWithoutTb}));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb}) {
        ${camelCaseTableNameWithoutTb}.set${camelCaseColumns[0].charAt(0).toUpperCase() + camelCaseColumns[0].slice(1)}(id);
        return ApiUtil.success(${camelCaseTableNameWithoutTb}Service.update(${camelCaseTableNameWithoutTb}));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return ApiUtil.success(${camelCaseTableNameWithoutTb}Service.delete(id));
    }

    @PutMapping("/order")
    public ResponseEntity<?> updateOrderBatch(@RequestBody List<${camelCaseTableNameUpper}> list) {
        int result = ${camelCaseTableNameWithoutTb}Service.updateOrderBatch(list);
        return ApiUtil.success(result); // 성공 건수 반환
    }
}
`;
  };

  const generateServiceCode = (camelCaseColumns) => {
    return `
package com.smart.rms.${filter.path}.service;

import com.smart.rms.${filter.path}.model.${camelCaseTableNameUpper};
import com.smart.rms.${filter.path}.mapper.${camelCaseTableNameWithoutTbUpper}Mapper;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ${camelCaseTableNameWithoutTbUpper}Service {

    private final ${camelCaseTableNameWithoutTbUpper}Mapper ${camelCaseTableNameWithoutTb}Mapper;

    public List<${camelCaseTableNameUpper}> findByKeyword(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb}) {
        return ${camelCaseTableNameWithoutTb}Mapper.findByKeyword(${camelCaseTableNameWithoutTb});
    }

    public ${camelCaseTableNameUpper} findById(Long id) {
        return ${camelCaseTableNameWithoutTb}Mapper.findById(id);
    }

    public ${camelCaseTableNameUpper} insert(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb}) {
        ${camelCaseTableNameWithoutTb}Mapper.insert(${camelCaseTableNameWithoutTb});
        return  ${camelCaseTableNameWithoutTb}Mapper.findById(${camelCaseTableNameWithoutTb}.get${camelCaseColumns[0].charAt(0).toUpperCase() + camelCaseColumns[0].slice(1)}());
    }

    public int update(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb}) {
        return ${camelCaseTableNameWithoutTb}Mapper.update(${camelCaseTableNameWithoutTb});
    }

    public int  delete(Long id) {
        return ${camelCaseTableNameWithoutTb}Mapper.deleteById(id);
    }

    public int updateOrderBatch(List<${camelCaseTableNameUpper}> list) {
        if (list == null || list.isEmpty()) return 0;
        int count = 0;
        for (${camelCaseTableNameUpper} item : list) {
            count += ${camelCaseTableNameWithoutTb}Mapper.updateOrderOne(item);
        }
        return count;
    }
}
`;
  };

  const generateMapperCode = () => {
    return `
package com.smart.rms.${filter.path}.mapper;

import com.smart.rms.${filter.path}.model.${camelCaseTableNameUpper};
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ${camelCaseTableNameWithoutTbUpper}Mapper {

    List<${camelCaseTableNameUpper}> findByKeyword(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb});
    ${camelCaseTableNameUpper} findById(@Param("id") Long id);
    int insert(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb});
    int update(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb});
    int deleteById(@Param("id") Long id);
    int updateOrderOne(${camelCaseTableNameUpper} ${camelCaseTableNameWithoutTb});
}
`;
  };

  const generateModelCode = (columns, modelClass) => {
    return `
package com.smart.rms.${filter.path}.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

  const generateCrudSql = (columns) => {
    if (!columns || columns.length === 0) return;

    let tableName = filter.tableName.toUpperCase();

    // 컬럼 이름을 카멜 표기법으로 변환 (컬럼명: 데이터타입 맵핑)
    const camelCaseColumns = columns.map(col => {
      return col.column_name.split('_').map((word, idx) => {
        return idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join('');
    });

    // SQL 쿼리 생성 함수
    const createSql = (type) => {
      const commonFields = columns.map(col => `${col.column_name.toUpperCase()}`).join('\n     , ');

      if (type === 'findByKeyword') {
        return `
<select id="findByKeyword" resultType="${camelCaseTableNameUpper}">
    SELECT /* ${camelCaseTableNameWithoutTbUpper}Mapper.findByKeyword */
         ${commonFields}
    FROM ${tableName}
    WHERE 1=1
    AND DEL_YN = 'N'
    ORDER BY ${columns[0].column_name.toUpperCase()} ASC
</select>`;
      }

      if (type === 'findById') {
        return `
<select id="findById" resultType="${camelCaseTableNameUpper}">
    SELECT /* ${camelCaseTableNameWithoutTbUpper}Mapper.findById */
         ${commonFields}
    FROM ${tableName}
    WHERE 1=1
    AND DEL_YN = 'N'
    AND ${columns[0].column_name.toUpperCase()} = #{id}
</select>`;
      }

      if (type === 'insert') {
        const valueFields = camelCaseColumns.map(col => `#{${col}}`).join('\n      , ');
        return `
<insert id="insert" parameterType="${camelCaseTableNameUpper}">
    <selectKey keyProperty="${camelCaseColumns[0]}" resultType="long" order="BEFORE">
        SELECT nextval('seq_${filter.tableName.toLowerCase().replace(/^tb_/, '')}')
    </selectKey>
    INSERT INTO ${tableName} ( /* ${camelCaseTableNameWithoutTbUpper}Mapper.insert */
         ${commonFields}
    )
    VALUES (
        ${valueFields}
    )
</insert>`;
      }

      if (type === 'update') {
        const updateFields = columns.slice(1).map((col, idx) => `
    <if test="${camelCaseColumns[idx + 1]} != null">
        , ${col.column_name.toUpperCase()} = #{${camelCaseColumns[idx + 1]}}
    </if>`).join('');

        return `
<update id="update" parameterType="${camelCaseTableNameUpper}">
    UPDATE ${tableName}    /* ${camelCaseTableNameWithoutTbUpper}Mapper.update */
    SET MOD_DT = CURRENT_TIMESTAMP${updateFields}
    WHERE ${columns[0].column_name.toUpperCase()} = #{${camelCaseColumns[0]}}
</update>`;
      }

      if (type === 'delete') {
        return `
<update id="deleteById">
    UPDATE ${tableName} /* ${camelCaseTableNameWithoutTbUpper}Mapper.deleteById */
    SET DEL_YN = 'Y'
      , MOD_ID = 'system'
      , MOD_DT = CURRENT_TIMESTAMP
    WHERE ${columns[0].column_name.toUpperCase()} = #{id}
</update>`;
      }

      if (type === 'updateOrderOne') {
        return `
<update id="updateOrderOne" parameterType="${camelCaseTableNameUpper}">
  UPDATE ${tableName}    /* ${camelCaseTableNameWithoutTbUpper}Mapper.updateOrderOne */
  SET ORDER_NO = #{orderNo}
    , MOD_ID = #{modId}
    , MOD_DT = CURRENT_TIMESTAMP
  WHERE ${columns[0].column_name.toUpperCase()} = #{${camelCaseColumns[0]}}
</update>`;
      }

    };



    // 모든 SQL 쿼리 생성
    const mapperXml = `
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.smart.rms.${filter.path}.mapper.${camelCaseTableNameWithoutTbUpper}Mapper">
    ${createSql('findByKeyword')}
    ${createSql('findById')}
    ${createSql('insert')}
    ${createSql('update')}
    ${createSql('delete')}
    ${createSql('updateOrderOne')}
</mapper>
`;

    setgeneratedSource(`
1. model
${generateModelCode(columns, camelCaseTableNameUpper)}
2. controller
${generateControllerCode(camelCaseColumns)}
3. service
${generateServiceCode(camelCaseColumns)}
4. mapper
${generateMapperCode()}
5. mapper.xml
${mapperXml}
`);
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
            value={generatedSource}
            onChange={(e) => setgeneratedSource(e.target.value)}  // onChange 핸들러 추가
          />
        </CCardBody>
      </CCard>
    </>
  );
};

export default DevGuide;
