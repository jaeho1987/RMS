import React, { useEffect, useState } from 'react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'

const BizCodeList = () => {
  const [treeData, setTreeData] = useState([])

  useEffect(() => {
    axiosInstance.get('/api/biz-code').then((res) => {
      setTreeData(res.data)
    })
  }, [])

  return (
      <div style={{ height: 'calc(100vh - 100px)', padding: '1rem' }}>
        <DhtmlxTreeGrid data={treeData} />
      </div>
  )
}

export default BizCodeList
