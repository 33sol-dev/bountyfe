"use client"

import { Home, MessageSquare, Database } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const data = [
  {
    waNo: "+91 97911 ...",
    name: "SHA HASTI...",
    phone: "+97911772...",
    pincode: "600079",
    state: "TAMILNADU",
    address: "44 NARAYAN...",
    city: "CHENNAI",
    landmark: "SOWCARPET",
  },
  {
    waNo: "+91 94438 ...",
    name: "dhinesh kumar",
    phone: "+94 438 03...",
    pincode: "632602",
    state: "Tamilnadu",
    address: "3 subedhar...",
    city: "gudiyatham",
    landmark: "near anandha silk house",
  },
  {
    waNo: "+91 98852 ...",
    name: "Gadiparthi ra...",
    phone: "+98 85 222...",
    pincode: "507303",
    state: "Telangana",
    address: "Sathupally",
    city: "Sathupally",
    landmark: "Suresh cycle shop road",
  },
]

export default function DataTable() {
  return (
    <div className="min-h-screen w-[80vw] bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WA No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone number</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Address Line</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Land Mark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-blue-50" : ""}>
                  <TableCell>{row.waNo}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.pincode}</TableCell>
                  <TableCell>{row.state}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>{row.landmark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
            <span>177 results</span>
          </div>
        </div>
      </main>
    </div>
  )
}

