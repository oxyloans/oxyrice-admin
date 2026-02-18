import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  message,
  Switch,
} from "antd";
import axios from "axios";
import CompaniesLayout from "../components/CompaniesLayout";
import BASE_URL from "../../../core/config/Config";
import "antd/dist/reset.css";
import { useLocation } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

const AddJobs = () => {
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [contactNumber, setContactNumber] = useState("");
  const location = useLocation();
  const companyFromState = location.state?.company || null;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/marketing-service/campgin/getallcompanies`,
        );
        setCompanies(res.data || []);
       
        if (companyFromState && res.data?.length) {
          const matchedCompany = res.data.find(
            (c) => c.id === companyFromState.id,
          );
          if (matchedCompany) {
            setSelectedCompany({
              companyId: matchedCompany.id,
              companyName: matchedCompany.companyName,
              companyWebsiteUrl: matchedCompany.websiteUrl,
              companyLogo: matchedCompany.logoUrl,
            });

            form.setFieldsValue({
              companyId: matchedCompany.id,
              companyName: matchedCompany.companyName,
              companyWebsiteUrl: matchedCompany.websiteUrl,
            });
          }
        }
      } catch (error) {
        console.error(error);
        message.error("Failed to load companies");
      }
    };
    fetchCompanies();
  }, []);


  const handleCompanyChange = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      const mappedCompany = {
        companyId: company.id,
        companyName: company.companyName || "",
        companyWebsiteUrl: company.websiteUrl || "",
        companyLogo: company.logoUrl || "",
      };

      setSelectedCompany(mappedCompany);

   
      form.setFieldsValue({
        companyName: mappedCompany.companyName,
        companyWebsiteUrl: mappedCompany.companyWebsiteUrl,
      });
    } else {
      setSelectedCompany(null);
      form.resetFields(["companyName", "companyWebsiteUrl"]);
    }
  };

 
  const onFinish = async (values) => {
    try {
      setLoading(true);

      const processedValues = {
        ...values,
        jobLocations: values.jobLocations ? values.jobLocations.join(",") : "",
        skills: values.skills ? values.skills.join(",") : "",
        workMode: values.workMode || "",
      };

      const payload = {
        ...processedValues,
        userId: localStorage.getItem("userId"),

        companyId: selectedCompany?.companyId || "",
        companyName: selectedCompany?.companyName || "",
        companyWebsiteUrl: selectedCompany?.companyWebsiteUrl || "",
        companyLogo: selectedCompany?.companyLogo || "",
        companyEmail: values.companyEmail || "",
        companyAddress: values.companyAddress || "",
        companyHeadQuarterLocation: values.companyHeadQuarterLocation || "",
        contactNumber: contactNumber || "",
        countryCode: countryCode || "+91",
      };

      await axios.post(
        `${BASE_URL}/marketing-service/campgin/postajob`,
        payload,
      );

      message.success("Job added successfully!");
      form.resetFields();
      setSelectedCompany(null);
      setContactNumber("");
      setCountryCode("+91");
    } catch (err) {
      console.error(err);
      message.error("Failed to add job");
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    "Information Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Marketing",
    "Telecommunications",
    "Real Estate",
    "Retail",
    "Hospitality",
    "Construction",
    "Transportation",
    "Energy",
    "Entertainment",
    "Agriculture",
    "Automotive",
    "Aerospace",
    "Biotechnology",
    "Consulting",
    "E-commerce",
    "Environmental Services",
    "Government",
    "Insurance",
    "Legal",
    "Media",
    "Non-Profit",
    "Pharmaceuticals",
    "Publishing",
    "Software Development",
    "Sports",
  ];

  const jobSources = [
    "LinkedIn",
    "Indeed",
    "Naukri",
    "Glassdoor",
    "Company Website",
    "Referral",
    "TimesJobs",
    "Monster",
    "Other",
    "CareerBuilder",
    "ZipRecruiter",
    "SimplyHired",
    "Upwork",
    "Freelancer",
    "AngelList",
    "Dice",
    "Craigslist",
    "Reddit",
    "Facebook Jobs",
    "Twitter Jobs",
  ];

  const jobLocations = [
    "New York",
    "London",
    "San Francisco",
    "Los Angeles",
    "Toronto",
    "Berlin",
    "Paris",
    "Sydney",
    "Singapore",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Dubai",
    "Tokyo",
    "Remote (Anywhere)",
    "Chicago",
    "Boston",
    "Seattle",
    "Austin",
    "Atlanta",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Amsterdam",
    "Barcelona",
    "Melbourne",
    "Hong Kong",
    "Beijing",
    "Seoul",
    "Mexico City",
  ];

  const skills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Java",
    "Spring Boot",
    "Python",
    "Django",
    "Flask",
    "C#",
    ".NET",
    "SQL",
    "MongoDB",
    "AWS",
    "Azure",
    "DevOps",
    "UI/UX Design",
    "Figma",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "Data Analysis",
    "PHP",
    "Ruby on Rails",
    "Go",
    "Swift",
    "Kotlin",
    "iOS Development",
    "Android Development",
    "PostgreSQL",
    "Redis",
    "GraphQL",
    "RESTful APIs",
    "Agile Methodology",
    "Scrum",
    "Project Management",
    "Salesforce",
    "Sales",
    "Marketing Automation",
    "SEO",
    "Content Writing",
    "Graphic Design",
    "Photoshop",
    "Illustrator",
    "Cybersecurity",
    "Blockchain",
    "Ethereum",
    "Big Data",
    "Hadoop",
    "Spark",
  ];

  const experiences = [
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "3-5 years",
    "5-7 years",
    "7-10 years",
    "10+ years",
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Executive Level",
    "Internship",
    "Fresher",
  ];

  const qualifications = [
    "High School Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "Ph.D.",
    "B.Tech",
    "B.E",
    "B.Sc",
    "M.Sc",
    "MBA",
    "MCA",
    "Diploma",
    "Certification Course",
    "Associate Degree",
    "Professional Certification",
    "Vocational Training",
    "GED",
    "Law Degree (LLB)",
    "Medical Degree (MBBS)",
    "Engineering Diploma",
    "Chartered Accountant (CA)",
    "Certified Public Accountant (CPA)",
  ];

  return (
    <CompaniesLayout>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10  min-h-screen">
        <Card
          title={
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Add New Job Posting
            </h2>
          }
          bordered={false}
          className="shadow-lg rounded-xl max-w-7xl mx-auto"
          // style={{
          //   background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          // }}
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            className="space-y-8"
          >
            {/* 🧱 Basic Information */}
            <Card
              title={
                <span className="text-lg font-semibold text-blue-600">
                  Basic Information
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl  bg-blue-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Job Title <span className="text-red-500">*</span>
                      </span>
                    }
                    name="jobTitle"
                    rules={[
                      { required: true, message: "Please enter job title" },
                    ]}
                  >
                    <Input
                      placeholder="e.g., Senior Frontend Developer"
                      className="rounded-lg border-blue-200 focus:border-blue-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Job Designation <span className="text-red-500">*</span>
                      </span>
                    }
                    name="jobDesignation"
                    rules={[
                      { required: true, message: "Please enter designation" },
                    ]}
                  >
                    <Input
                      placeholder="e.g., Developer"
                      className="rounded-lg border-blue-200 focus:border-blue-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Industry <span className="text-red-500">*</span>
                      </span>
                    }
                    name="industry"
                    rules={[
                      { required: true, message: "Please select industry" },
                    ]}
                  >
                    <Select
                      placeholder="Select Industry"
                      allowClear
                      size="large"
                      className="rounded-lg"
                      dropdownStyle={{ maxHeight: 300 }}
                    >
                      {industries.map((ind) => (
                        <Option key={ind} value={ind}>
                          {ind}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Job Type <span className="text-red-500">*</span>
                      </span>
                    }
                    name="jobType"
                    rules={[
                      { required: true, message: "Please select job type" },
                    ]}
                  >
                    <Select
                      placeholder="Select Job Type"
                      size="large"
                      className="rounded-lg"
                    >
                      <Option value="fulltime">Full-Time</Option>
                      <Option value="parttime">Part-Time</Option>
                      <Option value="contract">Contract</Option>
                      <Option value="internship">Internship</Option>
                      <Option value="temporary">Temporary</Option>
                      <Option value="freelance">Freelance</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Job Source
                      </span>
                    }
                    name="jobSource"
                  >
                    <Select
                      placeholder="Select Job Source"
                      allowClear
                      size="large"
                      className="rounded-lg"
                      dropdownStyle={{ maxHeight: 300 }}
                    >
                      {jobSources.map((src) => (
                        <Option key={src} value={src}>
                          {src}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Company <span className="text-red-500">*</span>
                      </span>
                    }
                    name="companyId"
                    rules={[
                      { required: true, message: "Please select company" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Search and select company"
                      onChange={handleCompanyChange}
                      size="large"
                      className="rounded-lg"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {companies.map((company) => (
                        <Option
                          key={company.id}
                          value={company.id}
                          label={company.companyName}
                        >
                          {company.companyName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 🏢 Company Details */}
            <Card
              title={
                <span className="text-lg font-semibold text-orange-600">
                  Company Details
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl  bg-orange-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Company Name
                      </span>
                    }
                    name="companyName"
                  >
                    <Input
                      placeholder="Company name"
                      readOnly
                      className="bg-gray-100 rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Company Website URL
                      </span>
                    }
                    name="companyWebsiteUrl"
                  >
                    <Input
                      placeholder="Website URL"
                      readOnly
                      className="bg-gray-100 rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Company Email
                      </span>
                    }
                    name="companyEmail"
                  >
                    <Input
                      placeholder="Company email"
                      className="rounded-lg border-orange-200 focus:border-orange-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Company Address
                      </span>
                    }
                    name="companyAddress"
                  >
                    <Input
                      placeholder="Company address"
                      className="rounded-lg border-orange-200 focus:border-orange-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Headquarter Location
                      </span>
                    }
                    name="companyHeadQuarterLocation"
                  >
                    <Input
                      placeholder="Headquarter location"
                      className="rounded-lg border-orange-200 focus:border-orange-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label={
                          <span className="text-gray-700 font-medium">
                            Country Code
                          </span>
                        }
                      >
                        <Select
                          value={countryCode}
                          onChange={setCountryCode}
                          style={{ width: "100%" }}
                          className="border-orange-200 focus:border-orange-400 hover:border-orange-300 rounded-lg"
                          size="large"
                        >
                          <Option value="+91">🇮🇳 +91 India</Option>
                          <Option value="+1">🇺🇸 +1 United States</Option>
                          <Option value="+44">🇬🇧 +44 United Kingdom</Option>
                          <Option value="+971">
                            🇦🇪 +971 United Arab Emirates
                          </Option>
                          <Option value="+61">🇦🇺 +61 Australia</Option>
                          <Option value="+81">🇯🇵 +81 Japan</Option>
                          <Option value="+49">🇩🇪 +49 Germany</Option>
                          <Option value="+33">🇫🇷 +33 France</Option>
                          <Option value="+39">🇮🇹 +39 Italy</Option>
                          <Option value="+34">🇪🇸 +34 Spain</Option>
                          <Option value="+7">🇷🇺 +7 Russia</Option>
                          <Option value="+86">🇨🇳 +86 China</Option>
                          <Option value="+82">🇰🇷 +82 South Korea</Option>
                          <Option value="+60">🇲🇾 +60 Malaysia</Option>
                          <Option value="+65">🇸🇬 +65 Singapore</Option>
                          <Option value="+94">🇱🇰 +94 Sri Lanka</Option>
                          <Option value="+880">🇧🇩 +880 Bangladesh</Option>
                          <Option value="+92">🇵🇰 +92 Pakistan</Option>
                          <Option value="+62">🇮🇩 +62 Indonesia</Option>
                          <Option value="+63">🇵🇭 +63 Philippines</Option>
                          <Option value="+84">🇻🇳 +84 Vietnam</Option>
                          <Option value="+966">🇸🇦 +966 Saudi Arabia</Option>
                          <Option value="+974">🇶🇦 +974 Qatar</Option>
                          <Option value="+968">🇴🇲 +968 Oman</Option>
                          <Option value="+973">🇧🇭 +973 Bahrain</Option>
                          <Option value="+20">🇪🇬 +20 Egypt</Option>
                          <Option value="+27">🇿🇦 +27 South Africa</Option>
                          <Option value="+55">🇧🇷 +55 Brazil</Option>
                          <Option value="+52">🇲🇽 +52 Mexico</Option>
                          <Option value="+54">🇦🇷 +54 Argentina</Option>
                          <Option value="+58">🇻🇪 +58 Venezuela</Option>
                          <Option value="+64">🇳🇿 +64 New Zealand</Option>
                          <Option value="+353">🇮🇪 +353 Ireland</Option>
                          <Option value="+31">🇳🇱 +31 Netherlands</Option>
                          <Option value="+47">🇳🇴 +47 Norway</Option>
                          <Option value="+46">🇸🇪 +46 Sweden</Option>
                          <Option value="+41">🇨🇭 +41 Switzerland</Option>
                          <Option value="+43">🇦🇹 +43 Austria</Option>
                          <Option value="+48">🇵🇱 +48 Poland</Option>
                          <Option value="+36">🇭🇺 +36 Hungary</Option>
                          <Option value="+420">🇨🇿 +420 Czech Republic</Option>
                          <Option value="+32">🇧🇪 +32 Belgium</Option>
                          <Option value="+30">🇬🇷 +30 Greece</Option>
                          <Option value="+90">🇹🇷 +90 Turkey</Option>
                          <Option value="+234">🇳🇬 +234 Nigeria</Option>
                          <Option value="+254">🇰🇪 +254 Kenya</Option>
                          <Option value="+256">🇺🇬 +256 Uganda</Option>
                          <Option value="+255">🇹🇿 +255 Tanzania</Option>
                          <Option value="+94">🇱🇰 +94 Sri Lanka</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item
                        label={
                          <span className="text-gray-700 font-medium">
                            Contact Number{" "}
                            <span className="text-red-500">*</span>
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter contact number",
                          },
                        ]}
                      >
                        <Input
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="Enter contact number"
                          className="border-orange-200 focus:border-orange-400 hover:border-orange-300 transition-colors rounded-lg"
                          size="large"
                          prefix={<span className="text-orange-400">📱</span>}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* ✅ Always show logo if available */}
              {selectedCompany?.companyLogo && (
                <div className="flex justify-center sm:justify-start items-center gap-4 mt-6 p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-center">
                    <img
                      src={selectedCompany.companyLogo}
                      alt="Company Logo"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain border-2 border-gray-200 rounded-lg shadow-md mx-auto"
                    />
                    <p className="text-sm text-gray-500 mt-2">Company Logo</p>
                  </div>
                </div>
              )}
            </Card>

            {/* 🌍 Location & Timeline */}
            <Card
              title={
                <span className="text-lg font-semibold text-green-600">
                  Location & Timeline
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl  bg-green-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Job Location <span className="text-red-500">*</span>
                      </span>
                    }
                    name="jobLocations"
                    rules={[
                      {
                        required: true,
                        message: "Please select job location(s)",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select one or more job locations"
                      allowClear
                      size="large"
                      className="rounded-lg"
                      dropdownStyle={{ maxHeight: 300 }}
                    >
                      {jobLocations.map((loc) => (
                        <Option key={loc} value={loc}>
                          {loc}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Application Deadline{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    name="applicationDeadLine"
                    rules={[
                      {
                        required: true,
                        message: "Please select application deadline",
                      },
                    ]}
                  >
                    <DatePicker
                      showTime
                      style={{ width: "100%" }}
                      size="large"
                      className="rounded-lg"
                      format="YYYY-MM-DD HH:mm:ss"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Work Mode <span className="text-red-500">*</span>
                      </span>
                    }
                    name="workMode"
                    rules={[
                      { required: true, message: "Please select work mode" },
                    ]}
                  >
                    <Select
                      placeholder="Select Work Mode"
                      size="large"
                      className="rounded-lg"
                    >
                      <Option value="onsite">Onsite</Option>
                      <Option value="hybrid">Hybrid</Option>
                      <Option value="remote">Remote</Option>
                      <Option value="flexible">Flexible</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <span className="text-lg font-semibold text-yellow-600">
                  Requirements & Qualifications
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl bg-yellow-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Experience (Years)
                      </span>
                    }
                    name="experience"
                  >
                    <Select
                      placeholder="Select Experience"
                      allowClear
                      size="large"
                      className="rounded-lg"
                      dropdownStyle={{ maxHeight: 300 }}
                    >
                      {experiences.map((exp) => (
                        <Option key={exp} value={exp}>
                          {exp}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Qualifications
                      </span>
                    }
                    name="qualifications"
                  >
                    <Select
                      placeholder="Select Qualification"
                      allowClear
                      size="large"
                      className="rounded-lg"
                      dropdownStyle={{ maxHeight: 300 }}
                    >
                      {qualifications.map((q) => (
                        <Option key={q} value={q}>
                          {q}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={24}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">Skills</span>
                    }
                    name="skills"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select required skills (e.g., React, Node.js)"
                      allowClear
                      size="large"
                      className="rounded-lg"
                      dropdownStyle={{ maxHeight: 300 }}
                    >
                      {skills.map((s) => (
                        <Option key={s} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 💰 Compensation & Benefits */}
            <Card
              title={
                <span className="text-lg font-semibold text-pink-600">
                  Compensation & Benefits
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl  bg-pink-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Minimum Salary
                      </span>
                    }
                    name="salaryMin"
                  >
                    <Input
                      prefix="₹"
                      placeholder="e.g., 50,000"
                      className="rounded-lg border-pink-200 focus:border-pink-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Maximum Salary
                      </span>
                    }
                    name="salaryMax"
                  >
                    <Input
                      prefix="₹"
                      placeholder="e.g., 80,000"
                      className="rounded-lg border-pink-200 focus:border-pink-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={24}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Benefits
                      </span>
                    }
                    name="benefits"
                  >
                    <TextArea
                      rows={3}
                      placeholder="e.g., Health Insurance, Paid Time Off, Remote Work Options"
                      className="rounded-lg border-pink-200 focus:border-pink-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <span className="text-lg font-semibold text-indigo-600">
                  Job Description
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl  bg-indigo-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={24}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Description
                      </span>
                    }
                    name="description"
                  >
                    <TextArea
                      rows={6}
                      placeholder="Provide a detailed job description including responsibilities, requirements, and company overview..."
                      className="rounded-lg border-indigo-200 focus:border-indigo-500"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 🔘 Job Status */}
            <Card
              title={
                <span className="text-lg font-semibold text-teal-600">
                  Job Status
                </span>
              }
              bordered={false}
              className="shadow-md rounded-2xl bg-teal-50/50"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Active Status
                      </span>
                    }
                    name="jobStatus"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      className="rounded-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ✅ Submit & Reset Buttons (Equal Size) */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                htmlType="button"
                onClick={() => form.resetFields()}
                size="large"
                style={{
                  width: "100px", // ✅ same width for both
                  height: "36px", // ✅ same height
                  borderRadius: "8px",
                  borderColor: "#d9d9d9",
                  color: "#333",
                  fontWeight: "600",
                  backgroundColor: "#f9f9f9",
                }}
                className="hover:!bg-gray-100 transition-colors duration-200"
              >
                Reset Form
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  width: "100px", // ✅ same width for both
                  height: "36px", // ✅ same height
                  backgroundColor: "#008cba",
                  borderColor: "#008cba",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
                className="hover:!bg-[#007399] transition-colors duration-200"
              >
                {loading ? "Submitting..." : "Publish Job"}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </CompaniesLayout>
  );
};

export default AddJobs;
